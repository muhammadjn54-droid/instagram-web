# AUTH — Sessions, cookies and the proxy

| Field | Value |
|---|---|
| Applies to | `src/lib/auth/**`, `src/proxy.ts`, `src/actions/auth.ts` |
| Backend | `POST /account/login` → `{ accessToken, refreshToken, expiresAt, user }` |
| Date | 2026-10-21 |
| Related | `API_CONTRACT.md` §4, `ARCHITECTURE.md` §8, `SECURITY.md` |

## 1. The model

```
Browser  ──(no credentials)──►  Next.js Server Action "login"
                                          │
                                          │ reads SESSION_SECRET, signs a cookie
                                          ▼
Browser  ◄──Set-Cookie: ig_session=<signed>; HttpOnly; SameSite=Lax; Path=/──  Next.js
                                          │
Browser  ──(cookie only)──►  Next.js Route Handler / Server Action
                                          │
                                          │ reads cookie, verifies signature
                                          │ adds Authorization: Bearer <accessToken>
                                          ▼
                                     NestJS backend
```

**The JWT is never sent to the browser and never stored in `localStorage`.**
The browser only ever holds an opaque, signed cookie that JavaScript cannot
read.

## 2. Cookie specification

| Property | Value | Why |
|---|---|---|
| Name | `ig_session` | Scoped to this app |
| Value | signed + base64url JSON payload | Opaque to the client |
| `httpOnly` | `true` | JavaScript cannot read it → an XSS bug cannot steal the token |
| `secure` | `true` in production, `false` in dev | HTTPS only in production |
| `sameSite` | `"lax"` | Blocks cross-site POSTs (CSRF defence) |
| `path` | `"/"` | Sent to every route |
| `maxAge` | 86400 (1 day) | Matches the backend JWT lifetime |

Cookie writes happen **only** in a Server Action or a Route Handler —
`cookies().set()` throws during render.

```ts
// src/lib/auth/session.ts
import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "ig_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24;

export type Session = {
  userId: number;
  userName: string;
  fullName: string;
  email: string;
  avatar: string;
  accessToken: string;
  expiresAt: number;
};

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET is not set");
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function sealSession(session: Session): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionCookie(value: string): Session | null {
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    return session.expiresAt * 1000 > Date.now() ? session : null;
  } catch {
    return null;
  }
}
```

> `timingSafeEqual` avoids leaking the signature through timing. A tampered
> cookie returns `null` — never an exception.

## 3. Reading the session

```ts
export async function getSession(): Promise<Session | null> {
  const store = await cookies();                     // async in Next 16
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return verifySessionCookie(raw);
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
```

* `redirect()` from `next/navigation` throws a special error — never wrap it
  in `try/catch` without re-throwing (`unstable_rethrow`).
* `requireSession()` is called **inside the DAL**, not by the page. The page
  never handles the token.

## 4. Login flow

```ts
// src/actions/auth.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { SESSION_COOKIE, sealSession, type Session } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/auth";

export type AuthActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  try {
    const result = await apiFetch<{
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
      user: { id: number; userName: string; fullName: string; email: string; avatar: string };
    }>(ENDPOINTS.auth.login, {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });

    const session: Session = {
      userId: result.user.id,
      userName: result.user.userName,
      fullName: result.user.fullName,
      email: result.user.email,
      avatar: result.user.avatar,
      accessToken: result.accessToken,
      expiresAt: Math.floor(Date.now() / 1000) + (result.expiresAt || 86400),
    };

    const store = await cookies();
    store.set(SESSION_COOKIE, sealSession(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  } catch (error) {
    return { status: "error", message: (error as Error).message };
  }

  redirect("/feed");
}
```

Notes:

* `expiresAt` from the backend is a **duration in seconds** (86400), not an
  absolute timestamp — convert it to an absolute epoch before storing.
* The action **returns** validation errors and **redirects** on success. It
  never throws for an expected failure.
* The `next` parameter is read from the search params and validated against a
  whitelist (only paths starting with `/` and not `//`) before redirecting
  there — otherwise it is an open redirect.

## 5. Register flow

```ts
export async function registerAction(_prev: AuthActionState, formData: FormData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", fieldErrors: … };
  }

  if (parsed.data.password !== parsed.data.confirmPassword) {
    return { status: "error", fieldErrors: { confirmPassword: "Passwords do not match" } };
  }

  await apiFetch(ENDPOINTS.auth.register, { method: "POST", body: JSON.stringify(parsed.data) });
  // then sign the user in automatically
  return loginAction(_prev, formData);   // hmm — this re-reads formData
}
```

> The register DTO sent to the backend **must not** include `confirmPassword`
> if the backend forbids unknown fields (`whitelist: true` +
> `forbidNonWhitelisted: true` in `backend/src/main.ts` means an unexpected
> field is a **400**). The backend DTO *does* declare `confirmPassword`, so it
> is accepted — but strip it anyway if the backend DTO changes.

Implementation note: rather than re-using `loginAction` (which would
re-validate with the login schema), extract a `signIn(userName, password)`
helper and call it from both actions.

## 6. Logout

```ts
export async function logoutAction() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  try {
    await apiFetch(ENDPOINTS.auth.logout, { method: "POST" });
  } catch {
    // the local session is cleared regardless of the backend result
  }
  redirect("/login");
}
```

The backend logout only says "Logged out successfully"; it does not invalidate
the JWT. Clearing the cookie is what actually ends the session.

## 7. Password reset

| Step | Endpoint | Notes |
|---|---|---|
| 1. Request | `POST /account/forgot-password` | body `{ email }`; the backend returns a **token string**, it does not send an email |
| 2. Reset | `POST /account/reset-password` | body `{ token, email, password, confirmPassword }` |

Because the backend does not send an email, the demo UI shows the returned
token on screen and prefills the reset form with it. Clearly label it as a
development affordance.

## 8. `proxy.ts` — the optimistic check

```ts
// src/proxy.ts
import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "ig_session";
const PUBLIC_PREFIXES = ["/login", "/register", "/forgot-password", "/reset-password"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (!hasCookie && !PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};
```

Rules:

* **One** proxy file per project, at `src/proxy.ts` (next to `app/`).
* `matcher` values must be **static constants**; a computed matcher is
  ignored by the framework.
* The proxy runs on the Node.js runtime. Setting `runtime` inside it throws.
* The proxy must **not** call the backend: it runs for every request,
  including prefetches, and a network call there would slow every navigation.
* The proxy is a *redirect*, not a *security boundary*. The real check is
  `requireSession()` in the DAL.
* The proxy is **not** applied to Server Function calls to a path excluded by
  the matcher — Server Functions are POSTs to the route where they are used.

## 9. Access rules per area

| Area | Rule |
|---|---|
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Public; a signed-in user is redirected to `/feed` |
| `/` | Public; a signed-in user is redirected to `/feed` |
| `/explore`, `/post/[id]`, `/profile/[userName]` | Public (the backend also marks these `@Public`) |
| `/feed`, `/reels`, `/stories`, `/messages/**`, `/saved`, `/search`, `/post/new`, `/profile/me/edit` | Private → `requireSession()` |

## 10. Guarding the UI

The session user is needed in many components. Do **not** fetch the session
from each component — pass it down from the layout, or read it in the Server
Component that needs it:

```tsx
// src/app/(main)/layout.tsx
export default async function MainLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar user={session ? { userName: session.userName, avatar: session.avatar } : null} />
      …
    </div>
  );
}
```

Client Components receive only what they need — never the `accessToken`.

## 11. Checklist

- [ ] The login response is stored in an **httpOnly** cookie.
- [ ] No `accessToken` / `refreshToken` string appears in the HTML, in
      `localStorage`, in `sessionStorage`, in a query string or in the JS
      bundle.
- [ ] The cookie is `Secure` in production and `SameSite=Lax`.
- [ ] The session cookie value is signed and verified with a constant-time
      comparison.
- [ ] `requireSession()` is called inside every DAL function that needs a
      token.
- [ ] `proxy.ts` exists and `middleware.ts` does not.
- [ ] Logout clears the cookie even if the backend call fails.
- [ ] The `next` redirect target is validated (no open redirect).
- [ ] A `401` from the backend clears the session and redirects to `/login`.
