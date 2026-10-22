# Page Specifications & Layout Contracts — Instagram Web Clone

> **Document Version:** 1.0  
> **Architecture:** Next.js App Router (React 19 + TypeScript)

---

## 1. Global Layout Specification (`src/app/layout.tsx`)

* **Role:** Server Component shell providing HTML root, global font definitions, meta tags, and root theme context.
* **Metadata Contract:**
  * Title template: `%s · Instagram` (default: `Instagram`)
  * Favicon: `/favicon.ico`
  * Viewport: `width=device-width, initial-scale=1, maximum-scale=1`
* **DOM Structure:**
  ```tsx
  <html lang="ru" className="h-full bg-white antialiased">
    <body className="min-h-full flex flex-col font-sans text-neutral-900 bg-white">
      {children}
    </body>
  </html>
  ```

---

## 2. Authenticated App Layout (`src/app/(authenticated)/layout.tsx`)

* **Role:** Shared persistent navigation shell for all authenticated views (`/`, `/explore`, `/reels`, `/direct`, `/[username]`, `/accounts/edit`).
* **Grid / Flex Layout:**
  * **Desktop (`≥ 1264px`):**
    * Sidebar width: `245px` (fixed left, full height, border-r).
    * Main Content area: `flex-1 ml-[245px] min-h-screen`.
  * **Tablet (`768px - 1263px`):**
    * Sidebar width: `72px` (icon-only, centered icons, border-r).
    * Main Content area: `flex-1 ml-[72px] min-h-screen`.
  * **Mobile (`< 768px`):**
    * Top Bar: `h-[48px]`, logo left, DM & notification icons right.
    * Main Content area: `pb-[48px] pt-[48px] min-h-screen`.
    * Bottom Bar: `h-[48px]` fixed bottom, 5 icons spread evenly.

---

## 3. Feed Page Specification (`src/app/page.tsx`)

* **Data Fetching:**
  * Stories Tray: `GET /stories` (grouped by user).
  * Main Feed: `GET /posts/feed?pageNumber=1&pageSize=10`.
* **Suspense & Error Boundaries:**
  * `<Suspense fallback={<FeedSkeleton />}>` around feed list.
  * `<Suspense fallback={<StoriesSkeleton />}>` around stories bar.
* **Layout Structure:**
  * Feed column: centered, max-width `470px` (or `630px` with suggested widget).
  * Right Sidebar widget (desktop `≥ 1024px`): Current user profile snippet + "Suggestions for you" list with Follow buttons.

---

## 4. Profile Page Specification (`src/app/[username]/page.tsx`)

* **Dynamic Route Parameter:** `username`
* **Data Fetching:**
  * Profile Data: `GET /profiles/:userId` (with `isFollowing` indicator).
  * User Posts: `GET /posts?userId=:userId`.
  * Saved Posts (if current user): `GET /profiles/me/favorites`.
* **Layout Structure:**
  * Max-width: `935px` centered with `px-4`.
  * Header grid: `col-span-1` avatar, `col-span-2` info & actions.
  * Navigation Tabs: Publications, Reels, Saved (only visible if viewing own profile).
  * 3-column square grid (`gap-1 sm:gap-7`).

---

## 5. Direct Messages Page Specification (`src/app/direct/page.tsx`)

* **Layout Structure:**
  * Container: `max-w-[935px] h-[calc(100vh-80px)] border rounded-lg overflow-hidden flex`.
  * Left Column: `w-[350px] border-r` listing active conversations with unread indicators.
  * Right Column: Active chat thread or empty placeholder ("Ваши сообщения").
