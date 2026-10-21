# GLOSSARY

Terms used across the frontend documentation, with the meaning they have
**in this project** (not a generic definition).

## A

| Term | Meaning here |
|---|---|
| **Action** | A Server Action — a `"use server"` function that mutates data on the server. Named `<verb>Action`. |
| **ADR** | Architecture Decision Record — a short note in `tz.md` §7 explaining a choice and its trade-offs. |
| **App Shell** | The part of a route that does not depend on the URL's data. With `partialPrefetching`, Next.js prefetches the App Shell per route instead of the whole page. |
| **App Router** | The Next.js router in `src/app/` — file-system based, Server Components by default. |

## B

| Term | Meaning here |
|---|---|
| **Backend readiness** | How much of the backend is actually mounted and usable — tracked in `BACKEND_READINESS.md`. |
| **Bearer token** | The JWT in the `Authorization: Bearer <token>` header. Never leaves the server. |
| **Build ID** | A value in the cache key of a `"use cache"` scope; it changes on every deployment. |

## C

| Term | Meaning here |
|---|---|
| **Cache Components** | The Next.js 16 caching model enabled by `cacheComponents: true`. It replaces `export const revalidate` with `"use cache"` + `cacheLife()` + `cacheTag()`. |
| **cacheLife** | The freshness profile of a cached scope (`seconds`, `minutes`, `hours`, `days`, `weeks`, `max`). |
| **cacheTag** | A label on a cached scope so a mutation can invalidate exactly it. |
| **Client Component** | A component marked `"use client"`. It runs in the browser and may use state and effects. |
| **Connection** | `connection()` from `next/server` — waits for a real request. Replaces `unstable_noStore`. |
| **CSR** | Client-side rendering. Used sparingly: only for interactive islands. |

## D

| Term | Meaning here |
|---|---|
| **DAL** | Data Access Layer — `src/lib/dal/**`. The only module that talks to the NestJS API. |
| **DTO** | Data Transfer Object — the shape the backend sends. Mirrored in `src/lib/types/**`. |
| **Dynamic route** | A route with a segment in square brackets, e.g. `/post/[id]`. |

## E

| Term | Meaning here |
|---|---|
| **Envelope** | The backend's response wrapper `{ statusCode, data, errors }`. The client also accepts a bare payload. |
| **`error.tsx`** | A route-level error boundary. A Client Component; it receives `error` and `retry`. |

## F

| Term | Meaning here |
|---|---|
| **Feed** | The list of posts published by the accounts the signed-in user follows (`GET /posts/feed`). |
| **Favourite** | A saved post (`POST /posts/:id/favorite`). The list is `/profiles/me/favorites`. |
| **Film** | Not used. The backend calls it `isReel`. |

## H

| Term | Meaning here |
|---|---|
| **httpOnly** | A cookie flag that makes the cookie invisible to JavaScript. The session cookie must always be httpOnly. |
| **Hydration** | The moment the server-rendered HTML becomes a live React app. |

## I

| Term | Meaning here |
|---|---|
| **Instrumentation** | `src/instrumentation.ts` — runs once per server instance. Not used yet. |
| **`io()`** | `next/cache`'s marker for a non-deterministic read (`Date.now()`, `Math.random()`). |

## L

| Term | Meaning here |
|---|---|
| **`layout.tsx`** | A shared wrapper for a route segment. It keeps its state across navigations. |
| **`loading.tsx`** | The Suspense fallback of a route segment. |

## M

| Term | Meaning here |
|---|---|
| **Metadata API** | Next.js's `metadata` / `generateMetadata` exports. The only way to set the title and the meta tags. |
| **`middleware.ts`** | **Deprecated** in Next 16. Use `proxy.ts`. |

## N

| Term | Meaning here |
|---|---|
| **Next.js 16** | The framework version in `frontend/package.json` (`16.4.2`). It has breaking changes — always check `node_modules/next/dist/docs/`. |

## P

| Term | Meaning here |
|---|---|
| **PagedResult** | The paginated payload: `{ items, totalCount, pageNumber, pageSize, totalPages }`. |
| **`params` / `searchParams`** | The dynamic route parameters and the query string. Both are **Promises** in Next 16. |
| **`partialPrefetching`** | Prefetches one reusable App Shell per route instead of a full prefetch per link. Requires `cacheComponents`. |
| **`proxy.ts`** | The renamed `middleware.ts`. One per project, at `src/proxy.ts`. |
| **P0 / P1 / P2** | Must / should / could. |

## R

| Term | Meaning here |
|---|---|
| **`revalidatePath` / `revalidateTag` / `updateTag`** | Cache invalidation. `updateTag` is Server-Actions-only and refreshes the current request; `revalidateTag` needs a profile argument. |
| **Reel** | A video post (`isReel = true`). |
| **Route group** | A folder in parentheses, e.g. `(main)` — it organises files without adding a URL segment. |
| **Route Handler** | A `route.ts` file — an HTTP endpoint inside the Next.js app. Used here only for the upload relays. |

## S

| Term | Meaning here |
|---|---|
| **Server Action** | A `"use server"` function; the only way the browser may mutate data. |
| **Server Component** | The default component type. Runs on the server, ships no JS. |
| **Session** | The signed cookie that carries the user's identity and the access token between requests. |
| **Story** | A 24-hour image post. |
| **Stale-while-revalidate** | Serving a cached value while refreshing it in the background. |

## T

| Term | Meaning here |
|---|---|
| **`"use cache"`** | The directive that marks a function, a component or a file as cacheable. |
| **`"use client"`** | The directive that marks a Client Component boundary. |
| **Tailwind v4** | The CSS-first Tailwind: the theme is configured in CSS with `@theme`, there is no `tailwind.config.js`. |
| **Turbopack** | The default bundler in Next 16. A custom `webpack` config fails the build. |

## U

| Term | Meaning here |
|---|---|
| **URL state** | State that lives in the query string (a tab, a search term). |

## W

| Term | Meaning here |
|---|---|
| **`"use server"`** | The directive that marks a Server Action. |
| **Web Vitals** | LCP, INP and CLS — the metrics in `PERFORMANCE.md` §1. |

## Symbols

| Symbol | Meaning |
|---|---|
| `/uploads/<file>` | A file served by the backend from disk. |
| `data.accessToken` | The JWT inside the response envelope. |
| `errors[]` | The array of human-readable error strings in a failed response. |
| `pageNumber` / `pageSize` | The backend's pagination parameters (not `page` / `limit`). |
