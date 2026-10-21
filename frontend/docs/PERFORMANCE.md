# PERFORMANCE

| Field | Value |
|---|---|
| Applies to | every route |
| Budget | see §2 |
| Date | 2026-10-21 |
| Related | `DATA_FETCHING.md`, `MEDIA.md`, `SEO.md` |

## 1. Targets

Core Web Vitals, measured on the **feed** route with a warm cache, on a
mid-range Android device over a 4G connection:

| Metric | Target | Good | Poor |
|---|---|---|---|
| LCP | ≤ 2.0 s | ≤ 2.5 s | > 4.0 s |
| INP | ≤ 150 ms | ≤ 200 ms | > 500 ms |
| CLS | ≤ 0.05 | ≤ 0.1 | > 0.25 |

## 2. Budget

| Asset | Budget |
|---|---|
| Initial JS (gzip) for `/feed` | ≤ 120 kB |
| CSS (gzip) | ≤ 20 kB |
| LCP image | ≤ 200 kB |
| Any other image on screen | ≤ 100 kB |
| Fonts | 2 families, `display: swap`, WOFF2 subset "latin" |
| Third-party scripts | 0 (no analytics in this release) |

Exceeding the JS budget is a build failure in CI, not a suggestion.

## 3. Rendering strategy

| Route | Strategy |
|---|---|
| `/` | Static (prerendered) |
| `/login`, `/register` | Static shell + client form |
| `/explore` | Cached (`"use cache"`), revalidated by tag |
| `/post/[id]`, `/profile/[userName]` | Cached per resource |
| `/feed`, `/messages/**`, `/saved`, `/stories` | Dynamic (session-bound), streamed through `<Suspense>` |

The dynamic pages must still feel instant: the **shell** (top bar, sidebar,
headings) is prerendered and streams first; the data arrives in a second
chunk.

## 4. Caching

| Data | Cache | Lifetime |
|---|---|---|
| Explore / reels / post detail / public profile | `"use cache"` | `cacheLife("minutes")` / `("hours")` |
| Session-bound data | none | per request |
| Static assets | the framework's default | immutable |

Rules:

* Never cache a personalised response in a shared scope.
* Tag every cached read so a mutation can invalidate exactly what it must.
* Use `updateTag` in a Server Action when the user must see their own change
  immediately.

## 5. Images

| Rule | Why |
|---|---|
| Always `next/image` | Automatic format negotiation (AVIF/WebP), resizing, lazy loading |
| Set `sizes` | The browser downloads the right resolution |
| `aspect-square` + `object-cover` | No layout shift |
| One `preload` per page | Only the LCP image |
| `quality={75}` | The default; higher costs bytes |

## 6. JavaScript

* Server Components by default — a component that does not need the browser
  costs **zero** client JS.
* `"use client"` marks a boundary; keep the client surface small.
* A Client Component that only renders static markup is a mistake — move it
  to the server.
* Avoid third-party libraries. A date formatter is 20 lines; a library is
  20 kB.
* `optimizePackageImports` can be added to `next.config.ts` when a package
  starts to matter.

## 7. Avoiding waterfalls

```tsx
// Bad — three sequential round trips
const profile = await getProfile(id);
const posts = await getPostsByUser(id);
const followers = await getFollowers(id);

// Good
const [profile, posts, followers] = await Promise.all([
  getProfile(id),
  getPostsByUser(id),
  getFollowers(id),
]);
```

`React.cache` deduplicates the same call across components in one render.

## 8. Avoiding layout shift

* Every image has `width`/`height` or an `aspect-*` parent.
* Skeletons have the **same shape** as the content.
* The like count reserves its width (`tabular-nums`, a min-width).
* The web font is loaded with `display: swap` and the fallback metrics are
  close enough — do not load a font late in the page.
* Nothing is inserted above the existing content after hydration (no
  "cookie banner" that pushes the feed down).

## 9. Splitting the bundle

| Route | Loaded on demand |
|---|---|
| `/feed` | The feed components |
| `/post/new` | The uploader, the preview logic |
| `/messages/[chatId]` | The composer, the attachment picker |
| `/stories` | The viewer, the progress bar |

Use `next/dynamic` only when a component is heavy and rarely needed — for
example the story viewer:

```tsx
const StoryViewer = dynamic(() => import("@/components/story/story-viewer"), {
  ssr: false,
  loading: () => <Skeleton className="fixed inset-0" />,
});
```

Never dynamically import a component that is needed for the first paint.

## 10. Measuring

| Tool | What it gives |
|---|---|
| `next build` | The route table with the static/dynamic markers (`○` prerendered, `ƒ` on demand). Note: v16 **removed** the `size` / `First Load JS` columns |
| Lighthouse (CI) | LCP / INP / CLS, accessibility, SEO |
| `useReportWebVitals` | Real-user metrics |
| Chrome DevTools → Performance | Where the time goes |
| `@next/bundle-analyzer` | What is inside the bundle |

```tsx
// src/app/layout.tsx or a dedicated client component
"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric.name, metric.value);
  });
  return null;
}
```

## 11. Anti-patterns

| Anti-pattern | Cost |
|---|---|
| The whole page is a Client Component | The whole page ships as JS |
| Fetching in `useEffect` | A waterfall and a late paint |
| `next/image` replaced by `<img>` | No optimisation, no lazy loading |
| A skeleton that does not match the content | CLS |
| A carousel that loads every slide at once | Bandwidth |
| A font loaded from a third party at runtime | A render-blocking request |
| `useSearchParams` without a `<Suspense>` | The whole route becomes client-rendered |

## 12. Checklist

- [ ] The route's bundle is within budget
- [ ] Public data is cached, private data is not
- [ ] No sequential `await` on independent requests
- [ ] Every image uses `next/image` with `sizes`
- [ ] The skeleton matches the content's shape
- [ ] Lighthouse performance ≥ 90 on `/feed`
- [ ] LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1
