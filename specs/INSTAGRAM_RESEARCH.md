# Instagram Web Experience — Research & Feature Discovery

> **Document Version:** 1.0  
> **Date:** October 2026  
> **Subject:** Comprehensive reverse-engineering and architectural discovery of the official Instagram Web Client (`https://www.instagram.com/`) for the `instagram-monorepo` web implementation.

---

## 1. Executive Summary & Methodology

This document records the empirical observation, architectural dissection, and official help documentation analysis of Instagram's desktop web and responsive mobile experiences.

- **Primary Source:** Publicly accessible endpoints and UI workflows on `https://www.instagram.com/`.
- **Secondary Source:** Official Meta Engineering, Instagram Help Center, and Web UI specifications.
- **Constraints Observed:** No credential stuffing, no private account bypass, no automated scraping that violates platform terms of service. All authenticated workflows are verified through test accounts and standard user journeys.

---

## 2. Feature Areas Discovered (Modules A – L)

### Module A: Account Access & Onboarding
* **Public URLs / Routes:**
  * Login: `/accounts/login/` (or `/` for unauthenticated visitors)
  * Registration: `/accounts/emailsignup/`
  * Password Recovery: `/accounts/password/reset/`
* **Purpose:** Identity verification, credential management, session establishment, and token issuance.
* **Observed Desktop UI:**
  * Dual-column layout: Left hero showcase (stacked phone story previews, headline *"Посмотрите, какими моментами из жизни поделились ваши близкие друзья."* with vibrant pink/magenta keyword highlights), right authentication card.
  * Form inputs with floating labels or styled placeholder boundaries (`rounded-xl` borders, `#0095F6` focus states).
  * Password input with show/hide toggle.
  * Primary action button (`bg-[#0095F6]`) disabled until required fields are filled.
  * Alternative login methods ("Войти с Email" in our scope, replacing legacy OAuth).
  * Footer with internationalization menu and legal/metadata links.
* **Responsive Behavior:**
  * Below `768px`, hero showcase collapses; card centers in viewport with 100% width and clean padding.
* **Authentication Requirement:** Public. Unauthenticated redirects send users to `/accounts/login/` with a `next` query param.
* **Scope Decision:** **IN SCOPE (P0)** — Implemented and active.

---

### Module B: Main Navigation & Application Shell
* **Routes:** Persistent across all authenticated routes.
* **Purpose:** Global wayfinding, creation trigger, profile access, and search/notification triggers.
* **Observed Desktop UI:**
  * Left sidebar pinned (`w-[245px]` on wide screens `> 1264px`, narrow `w-[72px]` icon-only between `768px` and `1264px`).
  * Top: Instagram wordmark logo (wide) or camera glyph (narrow).
  * Menu Items: Home, Search, Explore, Reels, Messages, Notifications, Create, Profile.
  * Bottom: "More" hamburger menu opening popover (Settings, Saved, Your activity, Switch appearance, Log out).
* **Responsive Behavior:**
  * Below `768px`: Top bar shows Instagram wordmark + Messages/Notifications; bottom bar (`h-[48px]`) shows 5 core icons: Home, Search, Create, Reels, Profile.
* **Scope Decision:** **IN SCOPE (P0)** — Application Shell foundation.

---

### Module C: Home Feed & Interactions
* **Routes:** `/` (authenticated)
* **Purpose:** Core consumption experience displaying real-time stories from followed creators and an infinite vertical feed of posts.
* **Observed UI Elements:**
  * **Stories Tray (Top):** Horizontal scrollable list with gradient ring avatars (`80px` diameter). Unviewed stories display gradient ring (orange/red/purple), viewed stories display gray ring.
  * **Post Cards:**
    * Header: Author avatar, username, location tag, timestamp, 3-dots context menu.
    * Media Container: 1:1 square or 4:5 vertical media carousel (up to 10 images) with dot indicators and next/prev arrows. Double-click/double-tap triggers floating heart animation.
    * Action Bar: Heart (Like), Speech Bubble (Comment), Paper Plane (Share), Bookmark (Save/Favorite).
    * Social Proof: Likes count ("Нравится: X"), author caption with collapsible "ещё...", comments count ("Посмотреть все комментарии (X)").
    * Inline Comment Input: Quick comment form with emoji trigger and "Опубликовать" button.
* **Responsive Behavior:** Feed width is fixed at `470px` on desktop, centered; expands to `100vw` edge-to-edge on mobile.
* **Scope Decision:** **IN SCOPE (P0)** — Primary consumption driver.

---

### Module D: Profiles & Relationships
* **Routes:** `/[username]/`, `/[username]/saved/`, `/[username]/reels/`
* **Purpose:** User identity representation, bio, statistics, follower/following management, and published content gallery.
* **Observed UI Elements:**
  * Header: Large avatar (`150px` desktop, `77px` mobile), username, Edit Profile / Follow / Unfollow / Message action buttons, gear icon (Settings).
  * Stats: Post count, Followers count, Following count. Clicking Followers/Following opens modal dialog with searchable user list.
  * Bio: Full name, description, clickable external website link.
  * Content Tabs:
    * 📷 Publications (3-column square grid, hover overlay showing like and comment counts).
    * 🎬 Reels (Vertical thumbnails with view counts).
    * 🔖 Saved (Private to account owner, bookmarks).
* **Scope Decision:** **IN SCOPE (P0)** — Essential social graph experience.

---

### Module E: Search & Discovery (Explore)
* **Routes:** `/explore/`, drawer search panel.
* **Purpose:** Discovering new creators, trending posts, and keyword/user lookups.
* **Observed UI Elements:**
  * Desktop Search: Clicking "Search" in left sidebar slides out a search drawer (`w-[397px]`) with debounced input, recent search history (with "Clear all" button and individual remove `x` buttons), and live result list.
  * Explore Grid: Non-uniform 3-column grid featuring occasional double-height reels mixed with standard square posts.
* **Scope Decision:** **IN SCOPE (P1)** — Search history and explore grid.

---

### Module F: Content Creation (Create Post)
* **Modal Trigger:** Persistent "Create" sidebar button (`/create/` or modal).
* **Purpose:** Multi-step upload wizard for single and multi-image posts.
* **Observed Workflow:**
  1. *Step 1 (Drag & Drop):* Modal with drop zone, file selector (supports JPG, PNG, WEBP).
  2. *Step 2 (Crop & Arrange):* Preview carousel, reorder images, select aspect ratio (1:1 Original, 4:5 Portrait, 16:9 Landscape).
  3. *Step 3 (Details):* Split view — media preview on left, caption input (up to 2,200 chars), emoji picker, location search autocomplete (`/locations`), and "Is Reel" toggle.
  4. *Step 4 (Publishing):* Submission to backend, progress spinner, success confirmation toast, and feed prepending.
* **Scope Decision:** **IN SCOPE (P0)** — Essential user generation driver.

---

### Module G: Reels
* **Routes:** `/reels/`, `/reels/[reelId]/`
* **Purpose:** Immersive full-screen vertical short-form video consumption.
* **Observed UI Elements:**
  * Centered 9:16 vertical video player (`max-w-[420px]`).
  * Right-side floating action column: Like button + count, Comment button + count, Share button, Bookmark button.
  * Bottom overlay: Creator avatar, username, "Follow" button, caption, audio track info.
  * Navigation: Up/Down arrow keys or mousewheel snap scroll to advance between reels.
* **Scope Decision:** **IN SCOPE (P1)** — Supported via post `isReel: true` flag.

---

### Module H: Stories (24-Hour Ephemeral Content)
* **Routes:** `/stories/[username]/[storyId]/`
* **Purpose:** 24-hour visual updates displayed sequentially.
* **Observed UI Elements:**
  * Fullscreen dark modal viewer.
  * Top progress bar divided into segments corresponding to user's active story count.
  * Auto-advance after 5 seconds per story; left/right click pauses/advances.
  * Like button (sends instant like to creator).
  * Author-only Viewers Drawer: Lists who viewed the story.
* **Scope Decision:** **IN SCOPE (P0)** — 100% backed by backend `/stories` API.

---

### Module I: Direct Messaging (Direct)
* **Routes:** `/direct/inbox/`, `/direct/t/[threadId]/`
* **Purpose:** 1-on-1 private messaging, conversation threads, and media sharing.
* **Observed UI Elements:**
  * Dual-column layout on desktop: Left panel conversation list (`w-[350px]`), right panel active chat view.
  * Active Chat: Header with partner name/avatar, scrollable message bubbles (outgoing right, incoming left), file/image attachment preview, text input with Enter-to-send, and read indicators.
* **Scope Decision:** **IN SCOPE (P1)** — Backed by backend `/chats` API.

---

### Module J: Activity & Notifications
* **Trigger:** Left sidebar "Notifications" button.
* **Observed UI Elements:**
  * Slide-out panel showing categorized notifications ("This week", "This month"):
    * Someone liked your photo (shows post thumbnail on right).
    * Someone commented on your photo.
    * Someone started following you (shows "Follow back" button).
* **Scope Decision:** **DEFERRED / OPTIONAL (P2)** — Can be simulated or hooked when backend notifications table is added.

---

### Module K: Settings & Account Management
* **Routes:** `/accounts/edit/`, `/accounts/password/change/`
* **Observed UI Elements:**
  * Left sub-navigation: Edit profile, Change password, Apps and websites, Email notifications, Help.
  * Edit Profile: Avatar changer (upload new photo, remove photo), Full Name, Username, Website, Bio, Gender.
  * Password Change: Old password, New password, Confirm new password.
* **Scope Decision:** **IN SCOPE (P1)** — Fully supported by backend `/profiles/me` and `/account/change-password`.

---

### Module L: System Pages & Edge States
* **404 Page:** "К сожалению, эта страница недоступна. Возможно, ссылка устарела или страница была удалена."
* **Empty Feed State:** "Добро пожаловать в Instagram! Подпишитесь на людей, чтобы видеть их публикации." with suggested users carousel.
* **Network Error / Disconnected:** Toast notification banner.
* **Scope Decision:** **IN SCOPE (P0)** — Essential for production reliability.
