# Responsive Design & Multi-Device Strategy — Instagram Web Clone

> **Document Version:** 1.0  
> **Minimum Supported Viewport:** `360px` width (standard modern smartphones)

---

## 1. Breakpoint Architecture

```text
Viewports:
 360px                 768px                 1024px               1264px
   ├─── Mobile Phone ────┼─── Tablet / Pad ────┼─── Desktop ────────┼─── Wide Desktop ───>
   │                     │                     │                    │
   • Bottom Nav (48px)   • Icon Sidebar (72px) • Icon Sidebar (72px)• Wide Sidebar (245px)
   • Top Bar (48px)      • Centered Feed       • Feed + Right Widget• Feed + Right Widget
   • Edge-to-edge cards  • Max-w 470px cards   • Max-w 630px total  • Max-w 935px total
```

---

## 2. Layout Rules per Breakpoint

### Mobile (`360px – 767px`)
* **Shell Navigation:**
  * Top Bar: Height `48px`, Instagram logo on left, Direct messages button on right.
  * Bottom Bar: Fixed bottom `48px`, 5 icons (Home, Search, Create, Reels, Profile) with `h-[24px]` icons.
* **Feed Cards:**
  * Media container width: `100vw` edge-to-edge.
  * Aspect ratio: 1:1 (`aspect-square`) or 4:5 (`aspect-[4/5]`).
  * Action row: Padding `px-3 py-2.5`.
* **Profile Header:**
  * Avatar size `77px`.
  * Stats (posts, followers, following) arranged horizontally below bio with top/bottom borders.

### Tablet (`768px – 1023px`)
* **Sidebar:** Width `72px` pinned left, icon-only, tooltips on hover.
* **Feed:** Centered in remaining viewport, max-width `470px`.

### Desktop & Wide (`≥ 1024px`)
* **Sidebar:** Expands to `245px` with Instagram logo and full text labels when `≥ 1264px`.
* **Feed Layout:** Dual column with feed on left (`470px`) and Suggested Users card on right (`320px`).

---

## 3. Touch & Gesture Standards

* Carousel swipe gestures on touchscreens via CSS `scroll-snap-type: x mandatory`.
* Double-tap like interaction with `pointer-events-none` floating heart animation.
* No horizontal scrollbars under any circumstance (`overflow-x: hidden` on viewport roots).
