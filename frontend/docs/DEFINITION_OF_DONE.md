# DEFINITION OF DONE

| Field | Value |
|---|---|
| Applies to | every task and every pull request |
| Date | 2026-10-21 |
| Related | `CODING_RULES.md`, `TESTING.md`, `SECURITY.md`, `ACCESSIBILITY.md` |

## 1. A task is done when

### Code

- [ ] The code compiles: `npm run build` → 0 TypeScript errors
- [ ] The linter is clean: `npm run lint` → 0 problems
- [ ] No `any`, no `as unknown as T`, no `@ts-ignore`
- [ ] No dead code, no commented-out code
- [ ] The new code follows `CODING_RULES.md` and `STYLING.md`

### Architecture

- [ ] Data reads go through the DAL (`src/lib/dal/**`), never a direct `fetch`
- [ ] Mutations are Server Actions in `src/actions/**`
- [ ] Every Server Action re-checks the session and re-validates its input
- [ ] No Client Component imports the DAL or `lib/auth/**`
- [ ] The session cookie stays `httpOnly`; no token is exposed to the client
- [ ] A cached read uses `"use cache"` + `cacheTag()`; a private read uses none

### UI

- [ ] The loading state exists (a skeleton or a Suspense fallback)
- [ ] The empty state exists and says what to do next
- [ ] The error state exists and offers a retry
- [ ] Every new interactive element is keyboard reachable with a visible focus ring
- [ ] Every image has an `alt`
- [ ] The layout works at 320 px and 200 % zoom
- [ ] Light and dark mode both look right

### Performance

- [ ] No new client bundle weight beyond the budget (`PERFORMANCE.md` §2)
- [ ] Images use `next/image` with `sizes`
- [ ] Independent requests are fetched in parallel

### Tests and docs

- [ ] A unit test covers every new utility or schema
- [ ] The E2E suite covers the new journey (or the manual checklist is updated)
- [ ] The documentation is updated when a contract, a route or a rule changes
- [ ] `docs/DEFINITION_OF_DONE.md` is satisfied for this task

## 2. A route is done when

- [ ] `page.tsx` exists and `await`s every `params` / `searchParams`
- [ ] A `loading.tsx` or a `<Suspense>` boundary exists
- [ ] An `error.tsx` boundary exists (or the inherited one is acceptable)
- [ ] `metadata` (and `generateMetadata` for a dynamic route) is set
- [ ] Private routes call `requireSession()`
- [ ] The route is reachable from the navigation
- [ ] The route works with and without a session
- [ ] A 404 for a missing resource calls `notFound()`

## 3. A new component is done when

- [ ] It is a Server Component unless it genuinely needs the browser
- [ ] Its props are typed with the DTO types
- [ ] It does not fetch data itself
- [ ] It has a documented prop contract in `docs/COMPONENTS.md`
- [ ] Its accessible name is defined
- [ ] It renders correctly in both themes

## 4. A release is done when

- [ ] `npm run build` and `npm run lint` pass
- [ ] The unit and E2E suites pass
- [ ] The manual checklist in `docs/TESTING.md` §3 is fully green
- [ ] Lighthouse: performance ≥ 90, accessibility ≥ 95, SEO ≥ 90 on `/feed`
- [ ] The security checklist in `docs/SECURITY.md` is green
- [ ] The accessibility checklist in `docs/ACCESSIBILITY.md` is green
- [ ] `docs/BACKEND_READINESS.md` has no open P0 item
- [ ] The changelog and the roadmap are updated

## 5. The quickest way to fail

| Mistake | Consequence | Prevention |
|---|---|---|
| `fetch` in a component | The token is missing → 401 | Use the DAL |
| Reading `cookies()` outside a Suspense leaf | The build fails | Move the read into the leaf |
| A parallel route slot without `default.tsx` | The build fails | Add the file |
| `useSearchParams` without a Suspense boundary | The build fails | Wrap the component |
| `revalidateTag("x")` with one argument | A TypeScript error | `revalidateTag("x", "max")` |
| `priority` on `next/image` | A deprecation warning | `preload` |
| `middleware.ts` | It is not picked up | `proxy.ts` |
| `next lint` | The command no longer exists | `eslint` |
| A dynamic Tailwind class | The class is never generated | Write the full class names |
| `export const dynamic` | Not allowed under `cacheComponents` | `"use cache"` + `cacheLife()` |
| A token in `localStorage` | A security failure | The httpOnly cookie |
