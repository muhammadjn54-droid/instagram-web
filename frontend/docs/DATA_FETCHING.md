# DATA FETCHING & CACHING

| Field | Value |
|---|---|
| Applies to | `src/lib/dal/**`, `src/lib/api/client.ts`, Server Components |
| Framework | Next.js 16 with `cacheComponents: true`, `partialPrefetching: true` |
| Date | 2026-10-21 |
| Related | `ARCHITECTURE.md` §6–§7, `API_CONTRACT.md`, `SERVER_ACTIONS.md` |

## 1. The model

`next.config.ts` enables **Cache Components**. Under that model the framework
decides what is static and what is dynamic, and the developer declares *what
may be cached* with the `"use cache"` directive. There are no `revalidate`
numbers in a segment config any more.

| Primitive | Import | Purpose |
|---|---|---|
| `"use cache"` | directive | Cache a function, a component or a whole file |
| `cacheLife(profile)` | `next/cache` | Set the freshness window of a cached scope |
| `cacheTag(tag, …)` | `next/cache` | Tag a cached scope for invalidation |
| `updateTag(tag)` | `next/cache` | Invalidate a tag **and** refresh the current request (Server Actions only) |
| `revalidateTag(tag, profile)` | `next/cache` | Stale-while-revalidate invalidation |
| `revalidatePath(path)` | `next/cache` | Path-scoped invalidation |
| `refresh()` | `next/cache` | Refresh the client router after a mutation |
| `connection()` | `next/server` | Wait for a real request (replaces `unstable_noStore`) |
| `io()` | `next/cache` | Mark a non-deterministic read (`Date.now`, `Math.random`) as I/O |

> `unstable_cache` is **replaced** by `"use cache"` in Next 16 — do not use it.
> `unstable_noStore` is replaced by `connection()` (or `io()`).

## 2. Which data is cached

| Surface | Cache? | Why |
|---|---|---|
| Explore feed (`GET /posts`) | ✅ `use cache` + `cacheLife("minutes")` + `cacheTag("posts")` | Public, identical for every user |
| Reels (`GET /posts/reels`) | ✅ `use cache` + `cacheTag("posts")` | Public |
| Post detail (`GET /posts/:id`) | ✅ `use cache` + `cacheTag("post:<id>")` | Public |
| Public profile (`GET /profiles/:userId`) | ✅ `use cache` + `cacheTag("profile:<id>")` | Public |
| User search (`GET /users?search=`) | ✅ short `cacheLife("seconds")` + `cacheTag("search:<term>")` | Public, changes often |
| Own feed (`GET /posts/feed`) | ❌ | Depends on who is signed in |
| Own profile (`GET /profiles/me`) | ❌ | Per user |
| Favourites (`GET /profiles/me/favorites`) | ❌ | Per user |
| Messages (`/chats*`) | ❌ | Private, must be fresh |
| Story list and viewers | ❌ | 24 h lifetime, must be fresh |
| Session / cookie reads | ❌ | Always per request |

**Rule of thumb:** if the response depends on the signed-in user, it is never
cached in a shared scope.

## 3. Writing a cached DAL function

```ts
// src/lib/dal/posts.ts
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { apiFetch } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { PagedResult, PostDto } from "@/lib/types";

export async function getPublicPosts(pageNumber = 1, pageSize = 10) {
  "use cache";
  cacheLife("minutes");
  cacheTag("posts");

  const qs = new URLSearchParams({ pageNumber: String(pageNumber), pageSize: String(pageSize) });
  return apiFetch<PagedResult<PostDto>>(`${ENDPOINTS.posts.list}?${qs}`);
}

export async function getPost(id: number) {
  "use cache";
  cacheLife("hours");
  cacheTag("posts", `post:${id}`);

  return apiFetch<PostDto>(ENDPOINTS.posts.byId(id));
}
```

Rules for a `"use cache"` scope:

* The function **must be async**.
* The cache key is derived from the serialisable arguments. A class instance,
  a function or a `URL` object is **not** a valid argument.
* A cached scope **cannot** read `cookies()`, `headers()` or `searchParams` —
  read them outside and pass the value in as an argument.
* `cacheLife()` and `cacheTag()` must be called **inside** the scope (module
  scope throws).
* The arguments must be primitives or plain data — a `PostDto` object works
  (it is a plain object), a `Date` works, a class instance does not.

### Cache lifetimes

| Profile | stale | revalidate | expire |
|---|---|---|---|
| `default` | 5 min | 15 min | never |
| `seconds` | 30 s | 1 s | 60 s |
| `minutes` | 5 min | 1 min | 1 h |
| `hours` | 5 min | 1 h | 1 d |
| `days` | 5 min | 1 d | 1 w |
| `weeks` | 5 min | 1 w | 30 d |
| `max` | 5 min | 30 d | 1 y |

A **short-lived** cache (`seconds`, `revalidate: 0`, or `expire < 5 min`) is
excluded from the prerender and becomes a dynamic hole — use it only for data
that genuinely changes every minute.

Custom profile:

```ts
cacheLife({ stale: 60, revalidate: 300, expire: 3600 });
```

## 4. Tags and invalidation

Tag every cached read with the entity it belongs to, so a mutation can
invalidate exactly what it must.

| Tag | Set by | Invalidated by |
|---|---|---|
| `posts` | `getPublicPosts`, `getPost`, `getReels` | create / delete post |
| `post:<id>` | `getPost(id)` | like, comment, favourite, delete |
| `profile:<userId>` | `getProfile(userId)` | profile update, follow / unfollow |
| `user:<userName>` | user search results | profile update |
| `feed` | own feed reads | new post by a followed user |
| `search:<term>` | user search | profile update |

```ts
// src/actions/post.ts
"use server";

import { updateTag } from "next/cache";
import { revalidatePath } from "next/cache";

export async function createPostAction(_prev: State, formData: FormData) {
  const post = await dal.createPost({ … });
  updateTag("posts");            // refresh the explore feed in this request
  updateTag("feed");
  revalidatePath("/feed");
  return { status: "success", postId: post.id };
}
```

* `updateTag(tag)` — **Server Actions only**. It expires the tag *and*
  refreshes the current request, so the user sees their own new post
  immediately (read-your-own-writes).
* `revalidateTag(tag, profile)` — the **second argument is required** in
  Next 16; the single-argument form is deprecated and is a TypeScript error.
* `revalidatePath("/feed")` — path-scoped; prefer tags when several routes
  show the same data.
* `refresh()` — refreshes the client router without touching the server cache.

## 5. Private (per-user) reads

```tsx
// src/components/feed/feed-list.tsx  (Server Component)
import { getFeed } from "@/lib/dal/posts";

export async function FeedList() {
  const page = await getFeed(1, 10);      // no "use cache" — per request
  return <FeedListView items={page.items} total={page.totalCount} />;
}
```

Because `getFeed` calls `requireSession()` → `cookies()`, the component is
dynamic. It must therefore sit under a `<Suspense>` boundary, otherwise the
build fails.

```tsx
// src/app/(main)/feed/page.tsx
import { Suspense } from "react";

export default function FeedPage() {
  return (
    <Suspense fallback={<FeedSkeleton />}>
      <FeedList />
    </Suspense>
  );
}
```

## 6. Parallel fetching

Sequential `await`s create waterfalls. Fetch independent things at once:

```tsx
const [profile, posts] = await Promise.all([
  getProfile(userId),
  getPostsByUser(userId),
]);
```

For the same value requested by several components in one render, wrap the
DAL function in React's `cache`:

```ts
import { cache } from "react";

export const getProfile = cache(async (userId: number) => { /* … */ });
```

> `React.cache` is isolated inside a `"use cache"` boundary — a value cannot
> be injected into a cached scope through `React.cache`.

## 7. Deduplicating requests

`apiFetch` uses `cache: "no-store"` by default (the DAL decides about
caching, not the HTTP layer). Inside a `"use cache"` scope the framework
caches the **result** of the function, so `apiFetch` itself does not need
`next: { revalidate }`.

Two different caches are involved, and they are easy to confuse:

| Cache | What it stores | How to control it |
|---|---|---|
| The HTTP data cache | The response body of a `fetch` | `fetch(url, { cache: "force-cache", next: { revalidate, tags } })` |
| The `"use cache"` scope cache | The **return value** of a function or component | `"use cache"` + `cacheLife()` + `cacheTag()` |

Do **not** mix the two models: do not add `next: { revalidate: 60 }` to a
fetch that already lives in a `"use cache"` scope.

## 8. Non-deterministic values

Reading `Date.now()`, `Math.random()` or `crypto.randomUUID()` inside a cached
scope makes the cache key unpredictable. Use `io()`:

```ts
import { io } from "next/cache";

export async function getFeed() {
  "use cache";
  const now = await io();                 // marks the read as I/O
  return buildFeed(now);
}
```

`io()` is a no-op inside a cached scope that already awaits something
dynamic, and it is used to keep non-deterministic reads out of the static
shell.

## 9. Loading and error UI

| Situation | Mechanism |
|---|---|
| The page is waiting for data | `<Suspense fallback={…}>` around the leaf, or `loading.tsx` |
| A route segment failed | `error.tsx` with `retry()` |
| The whole app failed | `global-error.tsx` |
| A resource does not exist | `notFound()` in the Server Component |
| The user may not see it | `forbidden()` / `unauthorized()` (experimental APIs) |
| A list is empty | an explicit empty state component, not a blank page |

Skeleton rule: the skeleton must have the **same shape** as the real content
(a 3:4 box for a post image, a 1:1 circle for an avatar) so the layout does
not shift when the data arrives (CLS).

## 10. Client-side fetching

The browser fetches **only** through Next.js — either a Server Action or a
Route Handler. It never calls the NestJS API directly, because it cannot add
the `Authorization` header.

```tsx
"use client";

import { useEffect, useState } from "react";

export function LoadMore({ endpoint }: { endpoint: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [cursor, setCursor] = useState(1);
  …
}
```

Prefer a Server Action for pagination over a Route Handler: the action can
read the session cookie and call the DAL directly.

```ts
// src/actions/post.ts
"use server";

export async function loadMorePostsAction(pageNumber: number) {
  const page = await getFeed(pageNumber, 10);
  return { items: page.items, totalCount: page.totalCount, totalPages: page.totalPages };
}
```

Calling a Server Action from a Client Component with `useTransition` gives a
pending state for free.

## 11. Pagination contract

```ts
export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
};
```

* `pageNumber` starts at **1**.
* `pageSize` is capped at **100** by the backend; the UI requests 10 (list)
  or 12 (grid).
* The next page exists when `pageNumber < totalPages`.

## 12. Error handling in the DAL

```ts
import { ApiError } from "@/lib/api/errors";

export async function getPost(id: number) {
  try {
    return await apiFetch<PostDto>(ENDPOINTS.posts.byId(id));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;   // → notFound()
    throw error;
  }
}
```

* A **404** becomes `null` → the page calls `notFound()`.
* A **401** clears the session and redirects to `/login`.
* Everything else propagates to the nearest `error.tsx`.

## 13. Anti-patterns

| Anti-pattern | Why it is wrong | Do instead |
|---|---|---|
| `fetch` in a component | The token cannot be attached | Use the DAL |
| `fetch` in a Client Component with the API URL | Exposes the backend and leaks data | Use a Server Action |
| `cache: "force-cache"` on every fetch | Caches personalised data across users | Cache only public reads, with `"use cache"` |
| `export const revalidate = 60` | Not allowed under `cacheComponents` | `cacheLife("minutes")` |
| `export const dynamic = "force-dynamic"` | Not allowed under `cacheComponents` | Read the request API inside a `<Suspense>` leaf |
| `unstable_cache` | Replaced in Next 16 | `"use cache"` |
| `revalidateTag("x")` | The single-argument form is deprecated and a TS error | `revalidateTag("x", "max")` |
| `noStore()` everywhere | Destroys caching for public data | Cache the public reads, stream the private ones |
| `await` in a loop | Waterfall | `Promise.all` |
| Reading `cookies()` outside a `<Suspense>` leaf | Build failure | Move it into the leaf |
