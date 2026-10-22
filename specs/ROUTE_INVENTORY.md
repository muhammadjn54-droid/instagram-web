# Route Inventory & Page Specifications — Instagram Web Clone

> **Document Version:** 1.0  
> **Route Count:** 13 Distinct Route Patterns Identified  
> **Framework:** Next.js App Router (`frontend/src/app/**`)

---

## 1. Complete Route Inventory Matrix

| # | Route Pattern | Role / Auth | Page Type | Status | Source File Reference | Key API Endpoints |
| :-: | :--- | :--- | :--- | :---: | :--- | :--- |
| **R-01** | `/` | Public / Auth | Full Page | **PARTIAL** | `src/app/page.tsx` | `/account/login`, `/posts/feed`, `/stories` |
| **R-02** | `/login` | Public Only | Full Page | **COMPLETE** | `src/app/login/page.tsx` | `POST /account/login` |
| **R-03** | `/register` | Public Only | Full Page | **COMPLETE** | `src/app/register/page.tsx` | `POST /account/register` |
| **R-04** | `/explore` | Protected | Full Page | **NOT COMPLETE** | `src/app/explore/page.tsx` | `GET /posts` |
| **R-05** | `/reels` | Protected | Full Page | **NOT COMPLETE** | `src/app/reels/page.tsx` | `GET /posts/reels` |
| **R-06** | `/direct` | Protected | Full Page | **NOT COMPLETE** | `src/app/direct/page.tsx` | `GET /chats`, `POST /chats` |
| **R-07** | `/direct/t/[chatId]` | Protected | Full Page | **NOT COMPLETE** | `src/app/direct/t/[chatId]/page.tsx` | `GET /chats/:id/messages`, `POST /chats/:id/messages` |
| **R-08** | `/[username]` | Protected | Full Page | **NOT COMPLETE** | `src/app/[username]/page.tsx` | `GET /profiles/:id`, `GET /users/:id/followers` |
| **R-09** | `/[username]/saved` | Protected (Owner) | Tab / Page | **NOT COMPLETE** | `src/app/[username]/saved/page.tsx` | `GET /profiles/me/favorites` |
| **R-10** | `/p/[postId]` | Protected / Public | Modal / Page | **NOT COMPLETE** | `src/app/p/[postId]/page.tsx` | `GET /posts/:id`, `GET /posts/:id/comments` |
| **R-11** | `/stories/[username]/[storyId]` | Protected | Modal / Route | **NOT COMPLETE** | `src/app/stories/[username]/[storyId]/page.tsx` | `GET /stories`, `POST /stories/:id/views` |
| **R-12** | `/accounts/edit` | Protected | Full Page | **NOT COMPLETE** | `src/app/accounts/edit/page.tsx` | `GET /profiles/me`, `PATCH /profiles/me` |
| **R-13** | `*` (Not Found / 404) | Public | Error Page | **NOT COMPLETE** | `src/app/not-found.tsx` | None |

---

## 2. Route Specifications in Detail

### R-01: Root Page (`/`)
* **Behavior:** Conditional router.
  * If no valid JWT in session: renders the modern Instagram split hero landing page (`AuthHero` + `AuthCard`).
  * If valid JWT in session: renders the authenticated `HomeFeed` (Stories Tray + Infinite Feed + Sidebar).
* **Components:** `AuthHero`, `AuthCard`, `Sidebar`, `StoriesTray`, `FeedCardList`, `SuggestedUsers`.
* **APIs:** `GET /posts/feed`, `GET /stories`, `GET /profiles/me`.
* **States:**
  * *Loading:* Skeleton post cards.
  * *Empty:* "Нет новых публикаций. Подпишитесь на других пользователей."
  * *Error:* Retry banner with reload button.

### R-02: Dedicated Login Page (`/login`)
* **Purpose:** Direct URL for authentication.
* **Layout:** Desktop dual-column (Brand hero on left with 3D story collage; Card on right with username/email & password inputs, show/hide toggle, blue submit button, "Войти с Email", "Создать новый аккаунт", test user quick-select).
* **APIs:** `POST /account/login`.
* **Status:** **COMPLETE** — Verified in local server with 200 OK.

### R-03: Dedicated Registration Page (`/register`)
* **Purpose:** New account creation.
* **Layout:** Dual-column brand hero + Registration form with 5 inputs: Email, Full Name, Username, Password, Confirm Password.
* **APIs:** `POST /account/register` -> auto-login via `POST /account/login`.
* **Status:** **COMPLETE** — Verified with backend database creation.

### R-04: Explore Grid (`/explore`)
* **Purpose:** Public discovery gallery.
* **Layout:** 3-column responsive grid with square tiles. Hovering over a tile displays overlay with like count and comment count. Clicking opens post modal.
* **APIs:** `GET /posts?pageNumber=1&pageSize=24`.

### R-05: Reels Feed (`/reels`)
* **Purpose:** Vertical reels player.
* **Layout:** Centered phone-width container (`w-[400px]`, `h-[calc(100vh-40px)]`) with snap scroll between items. Floating action bar on right (Like, Comment, Share).
* **APIs:** `GET /posts/reels`.

### R-06 & R-07: Direct Messaging (`/direct`, `/direct/t/[chatId]`)
* **Purpose:** Private messaging inbox and conversation view.
* **Layout:** Dual-column inbox: Left panel list of recent chats with avatar, name, last message preview, and unread indicator; Right panel active conversation thread with message bubbles, file attachment, and send input.
* **APIs:** `GET /chats`, `POST /chats`, `GET /chats/:id/messages`, `POST /chats/:id/messages`, `PATCH /chats/:id/read`.

### R-08 & R-09: Profile Page (`/[username]`)
* **Purpose:** User profile overview, stats, avatar management, and publications grid.
* **Layout:** Profile header with avatar, bio, counts (posts, followers, following), action button (Follow/Unfollow or Edit Profile). Navigation tabs: Posts, Saved, Reels.
* **APIs:** `GET /profiles/:id`, `GET /users/:id/followers`, `GET /users/:id/following`.

### R-10: Post Details (`/p/[postId]`)
* **Purpose:** Full post view with comments list and inline comment form.
* **Layout:** Dialog on desktop (media on left, comments list on right), full page on direct URL navigation.
* **APIs:** `GET /posts/:id`, `GET /posts/:id/comments`, `POST /posts/:id/comments`, `POST /posts/:id/like`.

### R-11: Story Viewer (`/stories/[username]/[storyId]`)
* **Purpose:** 24h fullscreen story experience.
* **Layout:** Dark backdrop, vertical story card, top segmented progress bars, navigation arrows, like button, reply input.
* **APIs:** `GET /stories`, `POST /stories/:id/views`, `POST /stories/:id/like`.

### R-12: Account Settings (`/accounts/edit`)
* **Purpose:** Profile details and password change.
* **Layout:** Sidebar settings navigation + form panel.
* **APIs:** `PATCH /profiles/me`, `PUT /profiles/me/avatar`, `PUT /account/change-password`.
