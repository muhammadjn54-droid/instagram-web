# DESIGN SYSTEM

| Field | Value |
|---|---|
| Applies to | `src/styles/**`, `src/app/globals.css`, `components/ui/**` |
| Date | 2026-10-21 |
| Related | `STYLING.md`, `COMPONENTS.md` |

## 1. Principles

1. **Tokens first.** A component never writes a raw colour, radius or font
   size — it uses a token (`bg-surface`, `text-muted-foreground`,
   `rounded-xl`).
2. **Instagram-like, not a clone.** The layout and the density resemble
   Instagram; the colour system is our own and must pass AA contrast.
3. **Mobile first.** The base layout is a single column; the sidebar appears
   at `md` and the wide layout at `lg`.
4. **Dark mode is a token swap**, never a second set of components.
5. **System fonts for UI, brand fonts for the wordmark.**

## 2. Colour tokens

Tokens are defined once in `globals.css` with Tailwind v4's `@theme inline`
and exposed as CSS variables so both light and dark modes can override them.

```css
/* src/app/globals.css */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  --background: #ffffff;
  --surface: #ffffff;
  --surface-muted: #f4f4f5;
  --foreground: #18181b;
  --muted-foreground: #71717a;
  --border: #e4e4e7;
  --ring: #18181b;
  --brand: #d62976;
  --brand-foreground: #ffffff;
  --destructive: #dc2626;
  --success: #16a34a;
  --warning: #d97706;
}

.dark {
  --background: #09090b;
  --surface: #18181b;
  --surface-muted: #27272a;
  --foreground: #fafafa;
  --muted-foreground: #a1a1aa;
  --border: #3f3f46;
  --ring: #fafafa;
  --brand: #e1306c;
  --brand-foreground: #ffffff;
  --destructive: #f87171;
  --success: #4ade80;
  --warning: #fbbf24;
}

@theme inline {
  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-surface-muted: var(--surface-muted);
  --color-foreground: var(--foreground);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-ring: var(--ring);
  --color-brand: var(--brand);
  --color-brand-foreground: var(--brand-foreground);
  --color-destructive: var(--destructive);
  --color-success: var(--success);
  --color-warning: var(--warning);

  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);

  --radius-card: 1rem;
  --radius-field: 0.5rem;
}
```

Usage:

```tsx
<div className="bg-surface text-foreground border-border rounded-xl" />
<button className="bg-brand text-brand-foreground hover:opacity-90" />
```

> **Do not** use `dark:` variants for colours that already have a token.
> A token that changes with the theme is the whole point of the system.

### Contrast requirements

| Pair | Minimum ratio |
|---|---|
| `foreground` on `background` | 4.5:1 (normal text) |
| `muted-foreground` on `background` | 4.5:1 |
| `brand-foreground` on `brand` | 4.5:1 |
| Any text on an image | add a scrim, or use a solid badge |

## 3. Spacing

Use Tailwind's scale. The app-specific rule:

| Context | Token |
|---|---|
| Card padding | `p-3` (mobile) / `p-4` (desktop) |
| Gap between cards in a feed | `space-y-6` |
| Page horizontal padding | `px-4` (mobile) / `px-6` |
| Icon button | `size-10` (touch target ≥ 40 px) |
| Vertical rhythm between sections | `space-y-8` |

Never use a pixel value that is not in the scale. If a new value is needed,
add it as a token.

## 4. Typography

| Element | Class |
|---|---|
| Page title | `text-xl font-semibold tracking-tight` |
| Card title | `text-sm font-semibold` |
| Body | `text-sm` |
| Secondary text | `text-xs text-muted-foreground` |
| Handle (`@user`) | `text-sm text-muted-foreground` |
| Post caption | `text-sm leading-relaxed` |
| Counts | `text-sm font-semibold` |

* Line length: keep prose under **70 characters** (`max-w-prose`).
* Never use a font size below `text-xs` (12 px).
* Use `tabular-nums` for counts that change in place (like counts).

## 5. Radii, borders, shadows

| Element | Radius | Border | Shadow |
|---|---|---|---|
| Card | `rounded-xl` (12 px) | `border border-border` | `shadow-sm` |
| Button (default) | `rounded-lg` | `border border-border` | none |
| Button (primary) | `rounded-lg` | none | none |
| Input | `rounded-lg` | `border border-border` | none |
| Avatar | `rounded-full` | none | none |
| Dialog | `rounded-2xl` | none | `shadow-lg` |
| Bottom sheet (mobile) | `rounded-t-2xl` | none | `shadow-lg` |

Use **one** elevation scale: `shadow-sm` (cards), `shadow-md` (sticky bars),
`shadow-lg` (overlays). No other shadows.

## 6. Icons

* Size: `size-5` (20 px) in navigation, `size-6` (24 px) in empty states.
* Stroke width: 1.75 for the outline set, 2 for the filled set.
* Colour: `currentColor`; a filled icon means "active" (liked, following).
* An icon-only control has an `aria-label` and a 40×40 px hit area.

## 7. Layout rules

### Breakpoints

| Name | Width | Layout |
|---|---|---|
| base | < 640 px | One column, bottom navigation, 100 % width |
| `sm` | ≥ 640 px | One column with side padding |
| `md` | ≥ 768 px | Sidebar (72 px, icons only) appears |
| `lg` | ≥ 1024 px | Sidebar (244 px, icons + labels), feed max 470 px |
| `xl` | ≥ 1280 px | Optional third column (suggested accounts) |

### Feed column

```tsx
<main className="mx-auto w-full max-w-[470px] px-0 sm:px-4">
```

The feed width matches the real product so the layout does not feel stretched.

### Profile grid

```tsx
<div className="grid grid-cols-3 gap-1 sm:gap-2">
```

Each cell is `aspect-square` with `object-cover`.

## 8. Motion

| Purpose | Duration | Easing |
|---|---|---|
| Hover / focus feedback | 100 ms | `ease-out` |
| Small transitions (opacity, colour) | 150 ms | `ease-out` |
| Dialog / sheet open | 200 ms | `ease-out` |
| Route transition | 250 ms | `ease-in-out` |

Rules:

* Animate only `opacity` and `transform` — animating `width`, `height` or
  `top` causes layout thrash.
* Respect `prefers-reduced-motion`:

```css
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

* The story viewer's auto-advance must stop when the user prefers reduced
  motion.

## 9. Dark mode without a flash

The theme is stored in `localStorage`, but the server-rendered HTML has no
knowledge of it. Add a tiny blocking script **before** the body content:

```tsx
// src/app/layout.tsx
<html lang="en" suppressHydrationWarning>
  <head>
    <script
      dangerouslySetInnerHTML={{
        __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`,
      }}
    />
  </head>
  …
</html>
```

`suppressHydrationWarning` on `<html>` is required because the script mutates
the class before hydration.

## 10. Component specs

### Button

| Variant | Background | Text | Use |
|---|---|---|---|
| `primary` | `bg-brand` | `text-brand-foreground` | The main action of a screen |
| `secondary` | `bg-surface-muted` | `text-foreground` | Secondary actions |
| `outline` | `border border-border` | `text-foreground` | Tertiary |
| `ghost` | transparent | `text-foreground` | Icon buttons, inline actions |
| `destructive` | `bg-destructive` | `text-white` | Delete, sign out |
| `link` | transparent | `text-brand underline` | Inline navigation |

States: default, hover, active, focus-visible (a 2 px `ring-ring` ring with a
2 px offset), disabled (`opacity-50`, `cursor-not-allowed`), loading
(spinner + `aria-busy`).

### Avatar

| Size | Tailwind | Typical use |
|---|---|---|
| `xs` | `size-6` | Comment list |
| `sm` | `size-8` | Comment list, chat list |
| `md` | `size-10` | Top bar, post header |
| `lg` | `size-20` | Story bubble |
| `xl` | `size-32` | Profile header |

When there is no image, render the initials on a `bg-surface-muted` circle.

### Form field

* Label: `text-sm font-medium`, 4 px below the field.
* Input height: 40 px (`h-10`).
* Error text: `text-xs text-destructive`, with `role="alert"`.
* Focus: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.
* Placeholder colour: `text-muted-foreground`.

## 11. Content guidelines

* Write the UI in **sentence case**: "Sign in", not "Sign In".
* Button labels are verbs: "Share", "Follow", "Delete".
* Error messages explain the fix: "Passwords do not match", not "Error 400".
* Never show a raw backend error to the user unless it is already
  human-readable; map it through `docs/API_CONTRACT.md` §7.
* Empty states always say what to do next.

## 12. Checklist

- [ ] No raw colour values in a component
- [ ] The component works in both themes
- [ ] Focus is visible on every interactive element
- [ ] The touch target is at least 40×40 px
- [ ] Text meets the AA contrast ratio
- [ ] Motion respects `prefers-reduced-motion`
