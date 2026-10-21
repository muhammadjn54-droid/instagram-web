# STYLING — Tailwind v4 and CSS

| Field | Value |
|---|---|
| Applies to | `src/app/globals.css`, `src/styles/**`, every component |
| Stack | Tailwind CSS v4 with `@tailwindcss/turbopack` |
| Date | 2026-10-21 |
| Related | `DESIGN_SYSTEM.md` |

## 1. The current setup

`next.config.ts` already registers the Tailwind loader for Turbopack:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
};

export default nextConfig;
```

`src/app/globals.css` starts with:

```css
@import "tailwindcss";
```

There is **no `tailwind.config.js`** — Tailwind v4 is configured in CSS. Do not
create one.

## 2. The three layers

| Layer | Where | Use for |
|---|---|---|
| Global CSS + tokens | `src/app/globals.css` | The Tailwind import, CSS variables, base element styles, the reduced-motion block |
| Tailwind utilities | In the markup | 90 % of the styling |
| CSS Modules | `src/styles/*.module.css` | Complex, stateful or keyframe-heavy styles that would produce unreadable class strings |

> Global CSS is imported in the root layout and **is not removed on
> navigation** (React's stylesheet support). Use it only for genuinely global
> styles — Tailwind's base layer, CSS variables, font faces.

## 3. Tailwind v4 specifics

### Theme tokens live in CSS

```css
@theme inline {
  --color-brand: var(--brand);
  --font-sans: var(--font-geist-sans);
  --radius-card: 1rem;
}
```

This creates the utilities `bg-brand`, `text-brand`, `font-sans`,
`rounded-card`. A token defined in `:root` **without** `@theme inline` does
**not** create a utility.

### Dark mode as a custom variant

Tailwind v4 does not enable the `dark:` variant by default:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

The `.dark` class is toggled on `<html>` by the theme script
(`DESIGN_SYSTEM.md` §9).

### Utilities are generated on demand

Tailwind v4 scans the source files. A class that is built dynamically is not
detected:

```tsx
// Wrong — the class is never generated
<div className={`bg-${color}-500`} />

// Right — the full class names are visible to the scanner
<div className={color === "red" ? "bg-red-500" : "bg-blue-500"} />
```

The same applies to `clsx`-style composition with template literals that
interpolate a partial class name.

### `@apply` in a module

`@apply` works inside a CSS module, but it hides the utility names from the
markup. Prefer plain utilities in JSX; use `@apply` only for a class that is
genuinely reused in many places (for example `.card`).

## 4. The `cn` helper

```ts
// src/lib/utils/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

`clsx` and `tailwind-merge` are **not installed yet**. Either add them
(`npm install clsx tailwind-merge`) or write the helper without them:

```ts
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
```

The `twMerge` version is preferred because it resolves conflicting Tailwind
classes (`px-2 px-4` → `px-4`).

## 5. Class naming

* One class per concern; long strings are fine:

  ```tsx
  <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
  ```

* Order follows: layout → box → typography → colour → effects → states →
  responsive. Keep the order consistent so `git diff` stays readable.
* Responsive variants go last.
* Do not use `!important` — fix the specificity instead.

## 6. CSS Modules

```tsx
// src/components/post/post-card.module.css
.card {
  border-radius: var(--radius-card);
  border: 1px solid var(--border);
  background: var(--surface);
}

@media (prefers-reduced-motion: no-preference) {
  .card {
    transition: opacity 150ms ease-out;
  }
}
```

```tsx
import styles from "./post-card.module.css";

<article className={styles.card}>…</article>
```

Rules:

* The file name matches the component: `post-card.module.css`.
* Use the CSS variables from the theme, never raw colours.
* One component per module file.
* Do not mix a module with Tailwind utilities on the same element unless the
  utilities only set layout.

## 7. Global styles

```css
/* src/app/globals.css */
@import "tailwindcss";

:root {
  --background: #ffffff;
  /* … */
}

@theme inline {
  /* … */
}

@media (prefers-color-scheme: dark) {
  :root:not(.dark) {
    /* only for the "system" theme before hydration */
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-geist-sans), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Global styles may only set: the CSS variables, base element resets,
`body`/`html` typography, scroll behaviour and the reduced-motion block.
Everything else belongs in a component.

## 8. Fonts

`next/font` self-hosts the font at build time — the browser never requests
it from Google.

```ts
// src/styles/fonts.ts
import { Geist, Geist_Mono } from "next/font/google";

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});
```

Rules:

* Define each font **once** in `src/styles/fonts.ts` and import it where it
  is needed — never create a second instance of the same family.
* Apply the `variable` class on `<html>` in the root layout.
* Reference the font in CSS through `var(--font-geist-sans)`.

## 9. Responsive rules

| Element | Mobile | Desktop |
|---|---|---|
| Page padding | `px-0` for the feed, `px-4` elsewhere | `px-6` |
| Navigation | Bottom bar (`< 768 px`) | Sidebar (`≥ 768 px`) |
| Feed column | Full width, edge to edge | `max-w-[470px]` centred |
| Post grid | 3 columns, 1 px gap | 3 columns, 8 px gap |
| Comment panel | Full-screen sheet | Inline under the post |
| Story tray | Edge to edge, 8 items visible | Centred, 10 items visible |

Use `min-h-dvh` (not `min-h-screen`) for full-height layouts so mobile
browser chrome does not clip the content.

## 10. Print and other media

Not supported in this release. Do not add `@media print` rules speculatively.

## 11. Lint and ordering

ESLint's `sort-imports` and CSS property ordering plugins are **not**
enabled — the import order is not enforced by the linter, but keep it
consistent by hand:

```ts
// 1. React / framework
import { Suspense } from "react";
import { notFound } from "next/navigation";

// 2. Internal — components, then lib, then types
import { PostCard } from "@/components/post/post-card";
import { getFeed } from "@/lib/dal/posts";
import type { PostDto } from "@/lib/types";

// 3. Side-effect imports last
import "./globals.css";
```

## 12. Checklist

- [ ] No raw colour, radius or size values in a component
- [ ] Tokens are declared in `@theme inline` so the utilities exist
- [ ] `dark:` is only used where a token is genuinely missing
- [ ] Dynamic class names are written out in full
- [ ] `prefers-reduced-motion` is respected
- [ ] No `!important` outside `globals.css`
- [ ] The layout works at 360 px, 768 px, 1024 px and 1440 px
