# ACCESSIBILITY

| Field | Value |
|---|---|
| Standard | WCAG 2.1 AA |
| Applies to | every screen and component |
| Date | 2026-10-21 |
| Related | `DESIGN_SYSTEM.md`, `COMPONENTS.md` |

## 1. Rules of thumb

1. Every interactive element is reachable with the keyboard, in a sensible
   order.
2. Every control has an accessible name.
3. Nothing is conveyed by colour alone.
4. Focus is always visible.
5. The layout works at 200 % zoom and with a 320 px viewport.
6. The page has exactly one `h1`, and the heading order never skips a level.

## 2. Keyboard

| Action | Key |
|---|---|
| Move between controls | `Tab` / `Shift+Tab` |
| Activate a button or link | `Enter` or `Space` (buttons) / `Enter` (links) |
| Close a dialog | `Escape` |
| Move inside a dialog | `Tab` is trapped inside the dialog |
| Move between tabs | `←` / `→` |
| Move between carousel slides | `←` / `→` |
| Dismiss a toast | `Escape`, or the close button |

Never remove the focus outline without replacing it:

```tsx
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
```

Use `focus-visible` (not `focus`) so a mouse click does not draw a ring, but
a keyboard interaction always does.

## 3. Semantic HTML

| Instead of | Use |
|---|---|
| `<div onClick>` | `<button type="button">` |
| `<div onClick>` on a navigation item | `<Link href>` |
| `<img>` | `next/image` with an `alt` |
| `<p>` for a heading | `<h1>`–`<h3>` |
| `<span>` for a button | `<button>` |
| `aria-label` on a `<div>` | a real `<button aria-label>` |

Buttons inside a form must declare `type="button"` unless they submit it —
otherwise an icon button inside a form submits the form by accident.

## 4. Accessible names

| Element | Name from |
|---|---|
| Icon-only button | `aria-label="Like post"` (required) |
| Decorative icon next to text | `aria-hidden="true"` |
| Avatar | `alt={user.fullName}` or `aria-label` on a non-image avatar |
| Image input | an associated `<label>` |
| Form field | `<label htmlFor>` — the placeholder is **not** a label |

```tsx
<IconButton label="Delete post">
  <TrashIcon aria-hidden="true" />
</IconButton>
```

## 5. Forms

* Every field has a `<label htmlFor>` bound to its `id` (`useId()` for a
  generated id).
* Errors: `aria-invalid="true"` on the field, `aria-describedby` pointing at
  the message, and the message has `role="alert"`.
* The submit button is disabled while the action is pending **and** the
  form has `aria-busy`.
* Required fields are marked with the `required` attribute, not only with an
  asterisk.
* Errors are summarised at the top of the form with links to the fields
  (optional, but recommended for long forms).

## 6. Images

| Image | `alt` |
|---|---|
| A post photo | `""` if it is decorative next to the caption, otherwise describe it |
| An avatar | The person's name |
| A story thumbnail | `"Story by <name>"` |
| A logo | The brand name, or `alt=""` next to a text wordmark |
| A decorative divider | `alt=""` |

## 7. Live regions and dynamic content

| Content | Mechanism |
|---|---|
| A toast | `role="status"` (polite) |
| A form error | `role="alert"` (assertive) |
| A loading spinner | `role="status"` + `aria-label="Loading"` |
| The like count changing | The button's `aria-pressed` changes; the count is inside the button's name |
| The comment count | Do not announce every change — keep it inside the button's accessible name |

## 8. Modals and dialogs

A dialog must:

* have `role="dialog"` and `aria-modal="true"`;
* be labelled by its title (`aria-labelledby`);
* trap the focus while open;
* restore the focus to the trigger on close;
* close on `Escape`;
* have a visible close button.

```tsx
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Delete post?</h2>
  …
</div>
```

## 9. Navigation

* The current page is marked with `aria-current="page"` on the active nav
  link.
* The `<nav>` landmark has an accessible name: `<nav aria-label="Primary">`.
* Skip to content: a visually hidden link that becomes visible on focus.

```tsx
<a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50">
  Skip to content
</a>
```

## 10. Landmarks

Each page has exactly one `<main>`. The layout provides `<header>`,
`<nav>` (primary and, when present, secondary) and `<footer>`. The sidebar
and the mobile navigation are two `<nav>` elements with different labels.

## 11. Motion and animation

* `prefers-reduced-motion` disables the story auto-advance and all
  transitions (`STYLING.md` §7, `DESIGN_SYSTEM.md` §8).
* Nothing flashes more than three times per second.
* Auto-playing content (the story viewer) has a pause control.

## 12. Colour contrast

| Text | Minimum |
|---|---|
| Body text | 4.5:1 |
| Large text (≥ 18.66 px bold or ≥ 24 px) | 3:1 |
| Icons and UI boundaries | 3:1 |
| Focus ring | 3:1 against the adjacent colour |

The muted foreground colour must be checked against the surface in **both**
themes.

## 13. Text zoom and reflow

* The layout must not break at a 320 px viewport.
* At 200 % zoom, no content is lost and no horizontal scrolling appears
  (except inside a deliberate carousel).
* Use relative units (`rem`, `%`) for font sizes and containers.

## 14. Testing

| Tool | What it checks |
|---|---|
| Keyboard only | Tab through the whole flow, confirm the focus is visible and the order is logical |
| Screen reader (NVDA / VoiceOver) | The page title, the landmarks, the form errors, the dialog |
| `axe DevTools` | Automated rule violations |
| Lighthouse accessibility | Score ≥ 95 |
| Browser zoom 200 % | Reflow |
| `prefers-reduced-motion` emulation | The animation is disabled |

## 15. Checklist for every screen

- [ ] One `h1`, correct heading order
- [ ] Every control has an accessible name
- [ ] The keyboard reaches every control, in order
- [ ] The focus ring is visible on every control
- [ ] Images have `alt`
- [ ] Form errors are announced and linked to the field
- [ ] Contrast passes AA
- [ ] The layout reflows at 320 px and 200 % zoom
- [ ] Reduced motion is respected
