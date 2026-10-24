# PAGE ROUTES — Frontend route map

> **STATUS NOTE (2026-10-23):** historical plan. The real route map is in `../../specs/ROUTE_INVENTORY.md`.


| Field | Value |
|---|---|
| Applies to | `frontend/src/app/**` |
| Router | Next.js 16 App Router |
| Date | 2026-10-21 |
| Related | `../tz.md` §13, `ARCHITECTURE.md` §10, `API_CONTRACT.md` |

## 1. Conventions

| Concept | Rule |
|---|---|
| Route groups | `(auth)` and `(main)` organise files without changing the URL |
| Dynamic segments | `params` is a **Promise** in Next 16 — always `await` it |
| Generated types | Use `PageProps<"/post/[id]">`, `LayoutProps<"/">`, `RouteContext<"/api/...">` |
| Loading UI | Every route with data gets a `loading.tsx` sibling or a `<Suspense>` leaf |
| Errors | Every route gets an `error.tsx` boundary (nearest one wins) |
| 404 | `not-found.tsx` at the root; `notFound()` raised from the DAL when a resource is missing |
| Metadata | `export const metadata` per page; `generateMetadata` for dynamic routes |
| Access | Enforced in the DAL (`requireSession()`), **not** only in `proxy.ts` |

`proxy.ts` lives at `src/proxy.ts` (next to `app/`). `middleware.ts` is
deprecated in Next 16 and must not be created.

## 2. Route table

| URL | File | Access | Data | Rendering notes |
|---|---|---|---|---|
| `/` | `(main)/page.tsx` | public | none | Marketing landing. A signed-in user is redirected to `/feed` |
| `/login` | `(auth)/login/page.tsx` | public | none | Redirects to `/feed` if a session exists |
| `/register` | `(auth)/register/page.tsx` | public | none | Redirects to `/feed` if a session exists |
| `/forgot-password` | `(auth)/forgot-password/page.tsx` | public | none | Posts `email` |
| `/reset-password` | `(auth)/reset-password/page.tsx` | public | none | Reads `token` + `email` from the query string |
| `/feed` | `(main)/feed/page.tsx` | private | `GET /posts/feed` | `<Suspense>` around the list |
| `/explore` | `(main)/explore/page.tsx` | public | `GET /posts` | `"use cache"` + `cacheTag("posts")` |
| `/reels` | `(main)/reels/page.tsx` | private | `GET /posts/reels` | `<Suspense>` leaf |
| `/stories` | `(main)/stories/page.tsx` | private | `GET /stories`, `GET /stories/me` | `<Suspense>` leaf + viewer dialog |
| `/messages` | `(main)/messages/page.tsx` | private | `GET /chats` | `<Suspense>` leaf |
| `/messages/[chatId]` | `(main)/messages/[chatId]/page.tsx` | private | `GET /chats/:chatId/messages` | `await params`; paginated, newest last |
| `/post/new` | `(main)/post/new/page.tsx` | private | none | Form + `ImageUploader` |
| `/post/[id]` | `(main)/post/[id]/page.tsx` | public | `GET /posts/:id`, `GET /posts/:id/comments` | `generateMetadata` from the post title |
| `/profile/[userName]` | `(main)/profile/[userName]/page.tsx` | public | `GET /profiles/:userId`, `GET /posts?userId=` | The backend keys profiles by **id**, the UI by **userName** → resolve the user first |
| `/profile/me/edit` | `(main)/profile/me/edit/page.tsx` | private | `GET /profiles/me` | Form |
| `/saved` | `(main)/saved/page.tsx` | private | `GET /profiles/me/favorites` | `<Suspense>` leaf |
| `/search` | `(main)/search/page.tsx` | private | `GET /users?search=`, `GET /search-history` | `searchParams` → `await` it |

## 3. Layouts

### `src/app/layout.tsx` (root)

Owns `<html>`, `<body>`, the fonts, the global CSS import and the providers.
It is the only place that may render `<head>` content — never hand-write
`<title>` or `<meta>`; use the Metadata API.

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { geistSans, geistMono } from "@/styles/fonts";

export const metadata: Metadata = {
  title: { default: "Instagram", template: "%s | Instagram" },
  description: "Share photos, reels and stories with the people you follow.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
```

`title.default` is **required** when a template exists, otherwise child
segments inherit a broken title.

### `src/app/(auth)/layout.tsx`

Centred card, max width ~ 400 px, no sidebar, no top bar.

### `src/app/(main)/layout.tsx`

```tsx
export default async function MainLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar session={session} />
      <div className="flex flex-1">
        <Sidebar session={session} />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
```

Reading the cookie here makes the layout dynamic — that is expected. The
**children** stay static and can still be cached.

## 4. Root layout variants

Do not add a second `<html>`/`<body>` outside `global-error.tsx`. Route groups
may add their own root layout only when a genuinely different document shell
is needed (for example a marketing site), and navigating between two root
layouts triggers a full page load.

## 5. Dynamic route patterns

```tsx
// src/app/(main)/post/[id]/page.tsx
import { notFound } from "next/navigation";
import { getPost } from "@/lib/dal/posts";

export async function generateMetadata(props: PageProps<"/post/[id]">) {
  const { id } = await props.params;
  const post = await getPost(id).catch(() => null);
  if (!post) return { title: "Post not found" };
  return { title: post.title ?? `Post by ${post.userName}` };
}

export default async function PostPage(props: PageProps<"/post/[id]">) {
  const { id } = await props.params;          // Promise — always await
  const post = await getPost(Number(id));
  if (!post) notFound();
  return <PostDetail post={post} />;
}
```

Rules:

* `params` and `searchParams` are **Promises**. Synchronous access was removed
  in Next 16.
* `searchParams` is a plain object, **not** a `URLSearchParams`.
* `searchParams` is only available in `page.tsx`, never in `layout.tsx`.
* Use `notFound()` for a missing resource — do not throw a generic error.

## 6. Route Handlers

Only four routes need a Route Handler, all of them multipart relays:

| Route | Method | Purpose |
|---|---|---|
| `/api/upload/post` | `POST` | Relay up to 10 images to the backend field `images` |
| `/api/upload/avatar` | `POST` | Relay one image to the backend field `image` |
| `/api/upload/story` | `POST` | Relay one image to the backend field `image` |
| `/api/upload/message` | `POST` | Relay one file to the backend field `file` |

```ts
// src/app/api/upload/avatar/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "image is required" }, { status: 400 });
  }

  const upstream = new FormData();
  upstream.append("image", file);

  try {
    const url = await apiFetch<string>(ENDPOINTS.avatar, {
      method: "PUT",
      body: upstream,
      token: session.accessToken,
    });
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 502 });
  }
}
```

Rules:

* `params` in a Route Handler is also a Promise: `{ params }: RouteContext<"/api/x/[id]">`.
* Always re-check the session inside the handler — a Route Handler is
  reachable by direct POST.
* Do not call your own Route Handlers from a Server Component; call the DAL.
* `GET` Route Handlers follow the same prerender model as pages under
  `cacheComponents`.

## 7. Suspense and streaming

```tsx
// src/app/(main)/feed/page.tsx
import { Suspense } from "react";

export default function FeedPage() {
  return (
    <Suspense fallback={<FeedSkeleton count={6} />}>
      <FeedList />
    </Suspense>
  );
}
```

* A component that reads `cookies()`, `headers()`, `params` or `searchParams`
  **must** sit under a `<Suspense>` boundary, or the build fails.
* `useSearchParams()` in a Client Component also requires a `<Suspense>`
  boundary; the production build fails with "Missing Suspense boundary with
  useSearchParams" otherwise.
* Prefer one boundary per leaf over one boundary at the top of the page: the
  shell paints first and the data streams in.

## 8. Metadata per route

| Route | `title` | `robots` |
|---|---|---|
| `/` | default (no override) | `index, follow` |
| `/login`, `/register` | "Sign in" / "Sign up" | `noindex, nofollow` |
| `/feed`, `/messages`, `/saved`, `/search` | "Feed" / "Messages" … | `noindex, nofollow` (private) |
| `/explore` | "Explore" | `index, follow` |
| `/post/[id]` | post title | `index, follow` |
| `/profile/[userName]` | `fullName (@userName)` | `index, follow` |

`generateMetadata` can call `notFound()` and `redirect()` like any Server
Component.

## 9. Navigation map

| From | To | Trigger |
|---|---|---|
| `/` | `/login`, `/register` | CTA buttons |
| `/` | `/feed` | automatic redirect when signed in |
| any private route | `/login?next=<encoded path>` | automatic redirect when signed out |
| `/login` | `/feed` (or `next`) | after a successful sign-in |
| top bar | `/`, `/explore`, `/reels`, `/messages`, `/stories`, `/profile/me`, `/saved`, `/search` | icons |
| post card | `/post/[id]`, `/profile/[userName]` | click on the caption or the avatar |
| chat list | `/messages/[chatId]` | click on a chat |
| sidebar | logout | clears the cookie and goes to `/login` |

Use `next/link` for internal navigation. `next/link` prefetches by default;
with `partialPrefetching: true` the default prefetch is the route's *App
Shell*, and `<Link prefetch={true}>` opts into a full prefetch.

## 10. `proxy.ts`

```ts
// src/proxy.ts
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (!hasSession && !PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|uploads|.*\\.png$).*)"],
};
```

Rules:

* Only **one** proxy file per project.
* `matcher` values must be **constants** — a dynamic matcher is ignored.
* The proxy is an **optimistic** check only. It never calls the backend: it
  runs on every request, including prefetches.
* The real check is `requireSession()` inside the DAL.
* The proxy runs on the **Node.js runtime**; the Edge runtime is not supported
  in `proxy` and setting `runtime` there throws.

## 11. Checklist for a new route

1. Create `src/app/(main)/<route>/page.tsx`.
2. `await` every `params` / `searchParams`.
3. Read data through the DAL, never `fetch` directly.
4. Wrap the data-reading leaf in `<Suspense>`.
5. Add a `loading.tsx` with a skeleton, or rely on the Suspense fallback.
6. Add an `error.tsx` if the route needs a specific failure UI.
7. Add `metadata` (and `generateMetadata` for dynamic routes).
8. Add the route to the sidebar / top bar navigation.
9. Check the route with and without a session.
