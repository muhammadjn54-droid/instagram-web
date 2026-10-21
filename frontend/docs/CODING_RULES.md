# CODING RULES

| Field | Value |
|---|---|
| Applies to | every file in `frontend/src` |
| Date | 2026-10-21 |
| Related | `ARCHITECTURE.md`, `STYLING.md`, `DEFINITION_OF_DONE.md` |

## 1. TypeScript

| Rule | Example |
|---|---|
| `strict` is on — never widen it | `tsconfig.json` has `"strict": true` |
| No `any` | Use the DTO type, or `unknown` + a type guard |
| No `as unknown as T` | Fix the type at the boundary instead |
| No `@ts-ignore` | Use `@ts-expect-error` with a comment explaining why |
| No non-null assertion `!` on a possibly-undefined value | Handle the `undefined` branch |
| `import type` for type-only imports | `import type { PostDto } from "@/lib/types";` |
| Interfaces for object shapes, `type` for unions | |

```ts
// Good
function isPostDto(value: unknown): value is PostDto {
  return typeof value === "object" && value !== null && "id" in value;
}

// Bad
const post = data as PostDto;
```

## 2. Naming

| Thing | Convention | Example |
|---|---|---|
| File | `kebab-case` | `post-card.tsx`, `api-client.ts` |
| Component | `PascalCase` | `PostCard` |
| Function / variable | `camelCase` | `getFeed`, `pageNumber` |
| Constant | `UPPER_SNAKE_CASE` | `MAX_IMAGE_SIZE` |
| Type | `PascalCase` | `PostDto`, `ActionState` |
| Boolean | `is` / `has` / `can` prefix | `isLikedByMe`, `hasMore` |
| Event handler prop | `on` + capital | `onFollow` |
| CSS module | `kebab-case.module.css` | `post-card.module.css` |
| Server action | `<verb>Action` | `createPostAction` |
| DAL function | `<verb><Resource>` | `getFeed`, `likePost` |

## 3. Imports

Order: React → framework → components → lib → types → side effects.

```ts
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { PostCard } from "@/components/post/post-card";
import { getFeed } from "@/lib/dal/posts";
import type { PostDto } from "@/lib/types";
```

* Use the `@/` alias (`tsconfig.json` maps it to `./src/*`).
* Never use a relative `../../` path between folders.
* One import per module.

## 4. Components

* `"use client"` is the **first** line of the file, before any import.
* A Client Component receives serialisable props only.
* A Server Component may be `async`; a Client Component may not.
* Name the props interface next to the component, or use an inline type.
* One component per file. A file over ~200 lines is split.
* Extract a sub-component only when it is reused or when it reduces the
  complexity of the parent.

## 5. React 19 specifics

| API | Use |
|---|---|
| `useActionState` | Form state returned by a Server Action |
| `useFormStatus` | The pending state of a **child** of a form |
| `useOptimistic` | An instant UI change while a Server Action runs |
| `useTransition` | A non-urgent state update (for example "load more") |
| `use` | Read a promise in a Client Component |

Prefer `useActionState` + `useFormStatus` over a hand-rolled
`isSubmitting` state.

## 6. Next.js 16 specifics

| Rule | Reason |
|---|---|
| `await params` / `await searchParams` | They are Promises; synchronous access was removed |
| `await cookies()` / `await headers()` | Same |
| `proxy.ts`, never `middleware.ts` | `middleware.ts` is deprecated |
| `"use cache"` instead of `unstable_cache` | `unstable_cache` was replaced |
| `cacheLife` + `cacheTag` instead of `export const revalidate` | `cacheComponents` forbids the segment config |
| `updateTag(tag)` in a Server Action | `revalidateTag(tag)` without a profile is deprecated and a TS error |
| `preload` instead of `priority` on `next/image` | `priority` is deprecated |
| `images.remotePatterns` instead of `images.domains` | `domains` is deprecated |
| `eslint` CLI, not `next lint` | `next lint` was removed in v16 |
| `PageProps<'/route'>`, `LayoutProps<'/route'>`, `RouteContext<'/route'>` | Generated, type-safe route helpers |
| A `default.tsx` for every parallel route slot | The build fails without it |

## 7. Data

| Rule | Reason |
|---|---|
| All data comes from the DAL | One place owns the token and the error mapping |
| The DAL returns the backend DTO unchanged | The mapping lives in the view layer |
| A paged read returns `PagedResult<T>` | One pagination contract |
| No `fetch` in a component | The token cannot be attached |
| No `fetch` to the API URL from a Client Component | It bypasses the session |
| `pageNumber` starts at 1 | The backend's contract |

## 8. Errors

| Situation | Rule |
|---|---|
| An expected failure (validation, 409) | Return an error **state**, do not throw |
| An unexpected failure | Throw — the nearest `error.tsx` handles it |
| A missing resource | `notFound()` |
| A forbidden action | Return a 403-style message to the user |
| A `404` from the backend | Map to `null` in the DAL, then `notFound()` in the page |

Never show a raw stack trace or a raw error object to the user.

## 9. Comments

* Comments explain **why**, not **what**.
* Do not comment out dead code — delete it (git remembers).
* A comment that documents a workaround must name the issue and link to it.

```ts
// Good
// The backend returns `content` while the create endpoint expects `comment`
// (API_CONTRACT.md §5). Do not "fix" the asymmetry.
```

## 10. Git and commits

* Branch: `feat/<area>-<short-description>`, `fix/<area>-<short-description>`.
* Commit messages in the imperative mood: "Add the feed list with skeletons".
* One logical change per commit.
* Never commit `.env.local`, `.next/`, or `node_modules/`.
* The managed block in `AGENTS.md` is regenerated by `next dev` — **commit it**
  with your work so the tree stays clean.

## 11. Formatting and linting

```bash
npm run lint        # eslint (next lint was removed in v16)
npm run build       # tsc + the Next.js build
```

* The ESLint config is `eslint.config.mjs` (flat config) with
  `eslint-config-next`.
* Match the surrounding style; do not reformat unrelated lines.
* The generated `AGENTS.md` block must never be removed by hand.

## 12. Dependencies

Before adding a dependency:

1. Can it be written in 20 lines? (a date formatter, a class-name helper)
2. Is it already in the tree? (`clsx`, `tailwind-merge` are small and common)
3. What does it cost in bundle size?
4. Is it maintained?

Current additions this project needs: `clsx`, `tailwind-merge`, `zod`,
`server-only` (bundled with Next, install only if the linter complains).

## 13. Checklist before opening a pull request

- [ ] `npm run build` passes with 0 errors
- [ ] `npm run lint` reports 0 problems
- [ ] No `any`, no `@ts-ignore`
- [ ] New data reads go through the DAL
- [ ] New mutations are Server Actions that re-check the session
- [ ] Every new route has a loading and an error state
- [ ] The keyboard reaches every new control
- [ ] No token in the client bundle
- [ ] The documentation is updated if a contract changed
