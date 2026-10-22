# Component Catalog & Interface Specifications — Instagram Web Clone

> **Document Version:** 1.0  
> **Status:** Implementation blueprint for reusable UI components.

---

## 1. Atoms & Primitives (`src/components/ui/`)

### `Button`
* **Props:** `variant ('primary' | 'secondary' | 'outline' | 'ghost' | 'danger')`, `size ('sm' | 'md' | 'lg')`, `loading?: boolean`, standard HTML button attributes.
* **Behaviors:** Accessible focus ring, disabled opacity, loading spinner replacement.

### `Input`
* **Props:** Standard HTML input attributes, `label?: string`, `error?: string`, `rightElement?: ReactNode`.
* **Behaviors:** `#0095F6` focus outline, red border on error, floating label or styled placeholder.

### `Avatar`
* **Props:** `src?: string | null`, `alt: string`, `size ('xs' | 'sm' | 'md' | 'lg' | 'xl')`, `hasStory?: boolean`, `isStoryViewed?: boolean`.
* **Behaviors:** Resolves image URL via `getMediaUrl()`. If `hasStory`, renders gradient border ring.

### `Modal`
* **Props:** `isOpen: boolean`, `onClose: () => void`, `title?: string`, `children: ReactNode`.
* **Behaviors:** Backdrop blur, `Escape` key close listener, focus trap, body scroll lock when open.

---

## 2. Authentication Components (`src/components/auth/`)

* **`AuthHero` [COMPLETE]:** Displays Instagram gradient camera emblem, headline with colored keyword highlights, and 3D story collage.
* **`AuthCard` [COMPLETE]:** Multi-mode card supporting `login`, `register`, `forgot`, and `email-login` with real NestJS backend integration.
* **`AuthFooter` [COMPLETE]:** Links, locale picker, and Meta attribution.

---

## 3. Shell & Navigation Components (`src/components/shell/`)

* **`DesktopSidebar` [NOT COMPLETE]:** Pinned sidebar supporting wide (`245px`) and collapsed (`72px`) responsive modes with icon navigation.
* **`MobileBottomBar` [NOT COMPLETE]:** Bottom navigation bar (`h-[48px]`) with 5 core actions.
* **`SearchDrawer` [NOT COMPLETE]:** Slide-out panel for user queries and recent search history management.

---

## 4. Feed & Story Components (`src/components/feed/`, `src/components/stories/`)

* **`StoriesTray` [NOT COMPLETE]:** Horizontal scroll tray displaying active 24h stories grouped by followed user.
* **`StoryViewerModal` [NOT COMPLETE]:** Fullscreen story viewer with 5-second progress bars and navigation controls.
* **`FeedCard` [PARTIAL]:** Single post card with author info, media carousel, like/save buttons, like counts, and comments preview.
* **`MediaCarousel` [NOT COMPLETE]:** Image slider for 1–10 images with swipe gestures and bullet indicators.

---

## 5. Profile & Direct Components (`src/components/profile/`, `src/components/chat/`)

* **`ProfileHeader` [PARTIAL]:** Avatar, bio, counts, and Follow / Edit Profile buttons.
* **`MediaGrid` [NOT COMPLETE]:** 3-column square grid of posts with hover overlay stats.
* **`ChatList` [NOT COMPLETE]:** Conversation threads with partner avatar, last message, and unread dot.
* **`ChatThread` [NOT COMPLETE]:** Active message feed with real-time text and attachment rendering.
