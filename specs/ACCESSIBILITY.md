# Accessibility (a11y) Standards — Instagram Web Clone

> **Document Version:** 1.0  
> **Target Standard:** WCAG 2.1 Level AA Compliance

---

## 1. Core Accessibility Principles

1. **Focus Visibility:**
   * Interactive controls must display an outline ring upon keyboard navigation:
     `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0095F6] focus-visible:ring-offset-2`.
2. **Text Contrast Ratios:**
   * Normal text (`< 18pt` or `< 14pt bold`): Minimum contrast ratio **4.5:1** against background.
   * Large text / icons: Minimum **3.0:1**.
   * Text colors used: `#171717` on white (16.1:1), `#737373` on white (4.8:1).
3. **Screen Reader Attributes (`aria-*`):**
   * Icon-only buttons must have an `aria-label`:
     * Heart button: `aria-label="Нравится"` / `aria-label="Не нравится"`
     * Comment button: `aria-label="Комментировать"`
     * Share button: `aria-label="Поделиться"`
     * Close button: `aria-label="Закрыть"`
   * Dynamic counts must use `aria-live="polite"` for live screen reader announcements.
4. **Keyboard Traps & Modal Control:**
   * Opening any dialog locks tab focus inside the modal.
   * Pressing `Escape` closes the active modal dialog.
   * Body scroll is locked with `overflow: hidden` while modal is open.
