# Design System & Visual Tokens — Instagram Web Clone

> **Document Version:** 1.0  
> **Styling Framework:** Tailwind CSS v4

---

## 1. Color Palette & Tokens

### Primary Brand Accents
* **Instagram Gradient:**
  `bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]`
  Used for logo emblems, unviewed story avatar rings, and highlighted CTA backgrounds.
* **Interactive Blue (Instagram Primary):**
  * Default: `#0095F6` (`bg-[#0095F6]`, `text-[#0095F6]`, `border-[#0095F6]`)
  * Hover: `#1877F2`
  * Active: `#0081D6`
  * Disabled: `opacity-60` with `cursor-not-allowed`

### Surface & Border Tones
* **Canvas Background:** `#FFFFFF` (`bg-white` or dark mode `#000000`)
* **Secondary Surface:** `#FAFAFA` / `#F0F2F5` (`bg-neutral-50` / `bg-neutral-100`)
* **Subtle Borders:** `#DBDBDB` / `#E5E7EB` (`border-neutral-200`)
* **Input Background:** `#FFFFFF` or `#F7F8F9` with `border-neutral-300`

### Text & Semantic Colors
* **Primary Text:** `#262626` / `#171717` (`text-neutral-900`)
* **Secondary Text:** `#737373` (`text-neutral-500`)
* **Tertiary Text / Placeholders:** `#8E8E8E` (`text-neutral-400`)
* **Destructive / Like Red:** `#ED4956` / `#FF3040` (`text-red-500`)
* **Success Green:** `#00C73C` / `#10B981` (`text-emerald-600`)

---

## 2. Typography

* **Font Family:**
  `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
* **Hierarchy:**
  * **H1 / Hero Titles:** `text-3xl sm:text-4xl font-bold tracking-tight leading-tight`
  * **Section Headers:** `text-[22px] font-semibold text-neutral-900`
  * **Card Headers / Usernames:** `text-sm font-semibold text-neutral-900`
  * **Body / Captions:** `text-xs sm:text-[13px] text-neutral-900 leading-normal`
  * **Metadata / Timestamps:** `text-[11px] text-neutral-400`

---

## 3. Radiuses & Elevation

* **Inputs & Standard Buttons:** `rounded-xl` (`12px`)
* **Content Cards & Panels:** `rounded-2xl` (`16px`)
* **Story Phone Frames:** `rounded-[32px]` / `rounded-[36px]`
* **Avatars & Action Pills:** `rounded-full`
* **Card Shadows:** `shadow-sm` (`0 1px 2px 0 rgb(0 0 0 / 0.05)`)
* **Modal Dialog Shadows:** `shadow-2xl` (`0 25px 50px -12px rgb(0 0 0 / 0.25)`)

---

## 4. Responsive Viewport Breakpoints

| Breakpoint | Width Range | Layout Characteristic |
| :--- | :--- | :--- |
| **Mobile** | `360px` – `767px` | 1-column feed, bottom nav bar, edge-to-edge media cards. |
| **Tablet** | `768px` – `1023px` | Icon-only left sidebar (`72px`), centered feed. |
| **Desktop** | `1024px` – `1263px` | Icon-only left sidebar (`72px`), feed + right suggested accounts widget. |
| **Wide Desktop**| `≥ 1264px` | Full expanded left sidebar (`245px`) with text labels, centered feed, right widget. |
