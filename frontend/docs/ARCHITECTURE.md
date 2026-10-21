# ARCHITECTURE — Frontend

| Field | Value |
|---|---|
| Applies to | `frontend/` @ Next.js `16.4.2` (App Router, Turbopack, Cache Components) |
| Date | 2026-10-21 |
| Related | `../tz.md` §6–§7, `CODING_RULES.md`, `DATA_FETCHING.md`, `AUTH.md` |

## 1. The one-paragraph version

The browser talks to **Next.js**, never to NestJS directly. Next.js Server
Components read data through a **Data Access Layer** (`src/lib/dal/**`) that
holds the bearer token, and mutations go through **Server Actions**. The
session lives in an **httpOnly cookie**, so no token is ever readable by
JavaScript. Public data is cached with `"use cache"` + `cacheTag()`; private
data is fetched per request behind a `<Suspense>` boundary.

## 2. Layers

```
┌──────────────────────────────────────────────────────────────┐
│ Browser                                                      │
│  Client Components (interactive islands)                     │
│  ──────────────── never import the DAL ────────────────      │
└───────────┬──────────────────────────────────┬───────────────┘
            │ Server Action / Route Handler     │ static assets
┌───────────▼──────────────────────────────────▼───────────────┐
│ Next.js server                                                │
│  Server Components ──► lib/dal ──► lib/api/client ──┐        │
│  Server Actions     ──► lib/dal ──► lib/api/client ──┤        │
│  proxy.ts (optimistic cookie check only)               │       │
└────────────────────────────────────────────────────────┼───────┘
                                                         │ HTTPS
                                            ┌────────────▼───────┐
                                            │ NestJS backend     │
                                            │ :3000  /account …  │
                                            └────────────────────┘
```

**The only outbound HTTP client is `src/lib/api/client.ts`.** Nothing else may
call `fetch(process.env.API_BASE_URL)`.

## 3. Directory rules

| Directory | May import from | May never import |
|---|---|---|
| `src/app/**` (pages, layouts) | `components/`, `lib/dal/**`, `lib/utils/**`, `lib/types/**` | `lib/api/client.ts` directly |
| `src/components/**` | `lib/utils/**`, `lib/types/**`, `lib/constants/**` | `lib/dal/**`, `lib/api/**` |
| `src/lib/dal/**` | `lib/api/**`, `lib/auth/**`, `lib/types/**` | `components/**` |
| `src/lib/api/**` | `lib/types/**` | `components/**`, `lib/dal/**` |
| `src/actions/**` | `lib/dal/**`, `lib/validation/**`, `lib/auth/**` | `components/**` |
| `src/hooks/**` | React only | `lib/dal/**`, `lib/api/**` |

Enforcement: `lib/dal/**` and `lib/auth/session.ts` start with
`import "server-only"`. If a file that must not see the token is imported into
a client bundle, the **build fails**. That is the mechanism — do not try to
work around it.

## 4. The folder tree

```
src/
├── app/
│   ├── layout.tsx                 # root layout — html, body, fonts, providers
│   ├── globals.css                # Tailwind v4 entry + design tokens
│   ├── error.tsx                  # route error boundary (Client Component)
│   ├── not-found.tsx              # 404
│   ├── (auth)/
│   │   ├── layout.tsx             # centred card, no app chrome
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx             # TopBar + Sidebar + MobileNav
│   │   ├── feed/page.tsx
│   │   ├── explore/page.tsx
│   │   ├── reels/page.tsx
│   │   ├── stories/page.tsx
│   │   ├── messages/page.tsx
│   │   ├── messages/[chatId]/page.tsx
│   │   ├── post/new/page.tsx
│   │   ├── post/[id]/page.tsx
│   │   ├── profile/[userName]/page.tsx
│   │   ├── profile/me/edit/page.tsx
│   │   ├── saved/page.tsx
│   │   └── search/page.tsx
│   └── api/
│       ├── upload/post/route.ts   # multipart relay to the backend
│       ├── upload/avatar/route.ts
│       ├── upload/story/route.ts
│       └── upload/message/route.ts
├── actions/
│   ├── auth.ts  post.ts  comment.ts  follow.ts
│   ├── favorite.ts  story.ts  chat.ts  profile.ts  search.ts
├── components/                    # see COMPONENTS.md
├── lib/
│   ├── api/
│   │   ├── client.ts              # fetch wrapper, envelope handling, errors
│   │   ├── endpoints.ts           # path constants, one place
│   │   └── errors.ts              # ApiError class + status → message map
│   ├── dal/
│   │   ├── auth.ts  posts.ts  profiles.ts  follows.ts
│   │   ├── comments.ts  favorites.ts  stories.ts  chats.ts
│   │   ├── users.ts  search-history.ts
│   │   └── index.ts               # the only barrel other code imports
│   ├── auth/
│   │   ├── session.ts             # cookie read/write/clear
│   │   └── password.ts            # hash/verify (server-only)
│   ├── validation/                # one schema per form
│   ├── types/                     # mirrors of the backend DTOs
│   ├── constants/                 # limits, routes, media rules
│   └── utils/                     # cn(), time formatting, initials
├── hooks/
├── styles/                         # fonts.ts, *.module.css
└── proxy.ts                        # next to app/, NOT middleware.ts
```

## 5. Server vs Client boundary

| Use a Server Component (default) for | Use a Client Component (`"use client"`) for |
|---|---|
| Reading data from the DAL | `onClick`, `onChange`, `onSubmit` handlers |
| Rendering the initial HTML of a route | Local UI state (open dialog, tab index) |
| Layouts and structural markup | `useState`, `useReducer`, `useEffect` |
| Anything that must not reach the browser | Third-party components that use state |
| Metadata (`metadata` / `generateMetadata`) | Browser APIs (`window`, `localStorage`) |

Rules:

* A Client Component **cannot be `async`**. Async data loading in the browser
  happens in a Client Component only through a Server Action or a Route
  Handler.
* `"use client"` marks the **boundary**. Everything imported *by* that file
  becomes client code too — keep the file small.
* Never pass a function or a class instance from a Server Component to a
  Client Component (it cannot be serialised).
* Never import the DAL into a Client Component. The `server-only` guard turns
  this into a build error, which is the intended behaviour.

### Where each feature lives

| Feature | Server | Client |
|---|---|---|
| Feed list | `FeedList` (Server) fetches pages | `LoadMoreButton` / `InfiniteScroll` (Client) requests the next page |
| Like button | `likeAction` (Server Action) | `LikeButton` (Client) — optimistic UI |
| Comment form | `createCommentAction` | `CommentForm` (Client) |
| Image uploader | upload Route Handler | `ImageUploader` (Client) — file picking, previews, validation |
| Theme toggle | — | `ThemeProvider` + `ThemeToggle` (Client) |

## 6. The API client

`src/lib/api/client.ts` is a thin wrapper that:

1. Builds the URL from `API_BASE_URL` + an endpoint constant.
2. Adds `Authorization: Bearer <token>` when a token is supplied.
3. Sends/reads JSON or `FormData` (never both).
4. Normalises the response into `{ data, statusCode, errors }`, accepting
   **either** the backend envelope **or** a bare payload (see ADR-007).
5. Throws an `ApiError` with `status`, `message` and `fieldErrors`.
6. Never throws for a `401`; it returns `null` and the caller decides to
   redirect (so a signed-out request does not crash the page).

Sketch:

```ts
// src/lib/api/client.ts
import "server-only";

export type Envelope<T> = {
  statusCode: number;
  data: T | null;
  errors: string[] | null;
};

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly errors: string[],
    readonly fieldErrors: Record<string, string> = {},
  ) {
    super(errors[0] ?? "Request failed");
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (rest.body && !(rest.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${process.env.API_BASE_URL}${path}`, {
    ...rest,
    headers,
    cache: "no-store",
  });

  const body = await res.json().catch(() => null);
  const payload: Envelope<T> | T | null = body;

  // The backend may or may not wrap the response (ADR-007).
  const isEnvelope =
    payload !== null &&
    typeof payload === "object" &&
    "statusCode" in payload &&
    "data" in payload &&
    "errors" in payload;

  const data = isEnvelope ? (payload as Envelope<T>).data : (payload as T);
  const errors = isEnvelope ? (payload as Envelope<T>).errors : null;

  if (!res.ok) {
    throw new ApiError(res.status, errors ?? [res.statusText], mapFieldErrors(body));
  }
  return data as T;
}
```

> `cache: "no-store"` is the default for the DAL. Public reads that should be
> cached do it in a `"use cache"` wrapper **around the DAL function**, not in
> `apiFetch` — see `DATA_FETCHING.md`.

## 7. The DAL

```ts
// src/lib/dal/posts.ts
import "server-only";
import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { requireSession } from "@/lib/auth/session";
import type { PostDto, PagedResult } from "@/lib/types";

export async function getPublicPosts(pageNumber = 1, pageSize = 10) {
  const qs = new URLSearchParams({ pageNumber: String(pageNumber), pageSize: String(pageSize) });
  return apiFetch<PagedResult<PostDto>>(`${ENDPOINTS.posts}?${qs}`);
}

export async function getFeed(pageNumber = 1, pageSize = 10) {
  const session = await requireSession();          // reads the cookie
  const qs = new URLSearchParams({ pageNumber: String(pageNumber), pageSize: String(pageSize) });
  return apiFetch<PagedResult<PostDto>>(`${ENDPOINTS.feed}?${qs}`, {
    token: session.accessToken,
  });
}
```

Rules:

* One DAL module per backend resource; the file name matches the backend
  module name.
* A DAL function returns **DTOs as the backend sends them**. Mapping happens
  in the component or a view-model helper, never in the DAL.
* A DAL function that needs the session calls `requireSession()` itself. The
  caller never passes a token down from a page.
* `src/lib/dal/index.ts` is the only barrel other modules import.

## 8. Session handling

```ts
// src/lib/auth/session.ts
import "server-only";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "ig_session";

export type Session = {
  userId: number;
  userName: string;
  fullName: string;
  email: string;
  avatar: string;
  accessToken: string;
  expiresAt: number; // epoch seconds
};

export async function getSession(): Promise<Session | null> {
  const store = await cookies();                   // async in Next 16
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const session = verifySessionCookie(raw);
  if (!session || session.expiresAt * 1000 < Date.now()) return null;
  return session;
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
```

* The cookie value is signed with `SESSION_SECRET`; a tampered cookie yields
  `null`, never a crash.
* `cookies().set()` is only allowed in a **Server Action** or a **Route
  Handler** — never during render.
* Full rules: `AUTH.md`.

## 9. Rendering model with Cache Components

`next.config.ts` enables `cacheComponents: true`. That means the framework
decides what is static and what is dynamic:

| Data | Where it is read | Result |
|---|---|---|
| Explore feed, reels, public profile, post detail | inside `"use cache"` | cached, shared between users |
| Own feed, own profile, favourites, chats, story viewers | plain async read in a `<Suspense>` leaf | dynamic, per request |
| Session cookie | `getSession()` in the layout | the layout becomes dynamic; the children stay static |

**Rule:** a request-time API (`cookies()`, `headers()`, `params`,
`searchParams`) must be read **inside** a component wrapped in `<Suspense>`,
otherwise the build fails with "blocking-route" — this is intentional.

```tsx
// src/app/(main)/feed/page.tsx
import { Suspense } from "react";
import { FeedList } from "@/components/feed/feed-list";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";

export default function FeedPage() {
  return (
    <Suspense fallback={<FeedSkeleton />}>
      <FeedList />
    </Suspense>
  );
}
```

## 10. Routing model

* Route groups `(auth)` and `(main)` organise files without changing the URL.
* `proxy.ts` (at `src/`, next to `app/`) does the **optimistic** check: it
  reads the cookie and redirects to `/login` if it is missing. It never calls
  the backend — it runs on every request, including prefetches.
* The **secure** check happens in the DAL (`requireSession()`), so a forged or
  expired cookie cannot read private data.
* Each dynamic segment uses the generated types:

```tsx
export default async function Page(props: PageProps<"/post/[id]">) {
  const { id } = await props.params;      // params is a Promise in Next 16
  ...
}
```

Run `npm run dev` or `npm run build` once so the generated `PageProps` /
`LayoutProps` / `RouteContext` types exist (`next typegen` does it explicitly).

## 11. State ownership

| State | Owner | How |
|---|---|---|
| Server data | The server | RSC + `"use cache"` + `cacheTag()` |
| Session | The server | httpOnly cookie, read by the DAL |
| URL state (tab, filter, page) | The URL | `searchParams` / `router.replace` |
| Ephemeral UI (dialog open, hover) | The component | `useState` |
| Form state | The form | React 19 `useActionState` + `useFormStatus` |
| Optimistic like/save state | The component | `useOptimistic` (React 19) |

There is **no** global client store. See `STATE_MANAGEMENT.md`.

## 12. Error handling

| Layer | Mechanism |
|---|---|
| Route segment | `error.tsx` — a Client Component with a `retry()` handler |
| Root | `global-error.tsx` — renders its own `<html>`/`<body>` |
| 404 | `not-found.tsx`, raised by `notFound()` in a Server Component |
| Data | `ApiError` thrown by the DAL, caught by the nearest boundary |
| Expected failures (invalid password, duplicate user) | returned as a typed `ActionState`, never thrown |

`error.tsx` must use `retry()`, not `reset()`:

```tsx
"use client";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <div role="alert">
      <h2>Something went wrong</h2>
      <button onClick={() => retry()}>Try again</button>
    </div>
  );
}
```

## 13. Configuration

`next.config.ts` is already set up and must keep these values:

```ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [{ protocol: "http", hostname: "localhost", port: "3000", pathname: "/uploads/**" }],
    qualities: [75],
  },
  turbopack: {
    rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } },
  },
};
```

Notes:

* `cacheComponents` and `partialPrefetching` are **top-level** in v16 (not
  under `experimental`).
* `partialPrefetching` requires `cacheComponents`; leaving it unset logs a
  warning.
* Under `cacheComponents`, `export const dynamic`, `export const revalidate`
  and `export const runtime` are **not allowed** in a segment.
* `images.qualities` defaults to `[75]` in v16 — any other `quality` prop is
  coerced to the nearest allowed value, and an unsupported `?q=` returns a
  400.
* A custom `webpack` config **fails the build** under Turbopack.

## 14. Rules of thumb

1. A page component is a Server Component by default; add `"use client"`
   only when you need interactivity.
2. If a component needs the session, it is a Server Component.
3. If a component needs the browser, it is a Client Component, and it must
   not import the DAL.
4. Data fetching lives in the DAL, never in a component.
5. Mutations live in `src/actions/**`, never in a component.
6. One `<Suspense>` per request-time leaf, no more.
7. No `any`. No `as unknown as T`. No `@ts-ignore`.
8. Every new route gets `loading` + `error` handling.
