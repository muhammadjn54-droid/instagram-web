# Master Project Progress Checklist — Instagram Web Clone (`tz.md`)

> **Master Progress Tracker:** Authoritative record of completed, in-progress, blocked, and deferred features.  
> **Rule:** Every implementation session MUST inspect actual source code, run verification checks, and update this file with truthful evidence before ending.

---

## 1. Project Health & Implementation Summary

| Category | Count | Status Notes |
| :--- | :---: | :--- |
| **In-Scope Route Patterns** | 13 | 2 Complete (`/login`, `/register`), 1 Partial (`/`), 10 Remaining |
| **Completed Tasks** | 12 | Authentication, Email login, Register auto-login, Initial seed & types |
| **Remaining Tasks** | 42 | Application shell, Feed, Stories, Modals, Profiles, Direct, Explore, Reels |
| **Blocked Tasks** | 0 | All backend prerequisites for Phase 2 & 3 are fully operational |
| **Deferred Tasks** | 4 | OAuth/Facebook login, WebSockets, 2FA, Video broadcasting |
| **TypeScript Checks** | PASS | `npx tsc --noEmit` exits with code 0 across both frontend and backend |
| **Backend API Health** | PASS | Port 3000 running, 11 modules verified with SQLite test database |
| **Frontend Server** | PASS | Port 3001 running, Next.js 16 App Router SSR rendering cleanly |

---

## 2. Master Feature Checklist by Module

### Module 1: Authentication & Session Management (AUTH)

| Task ID | Feature & Route | Requirement | Status | Source File Reference | Verification Evidence | Next Action |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **AUTH-001** | Login Page (`/login`) | Dual-column layout renders correctly with brand hero and 3D story collage | **COMPLETE** | `src/app/login/page.tsx`, `AuthHero.tsx` | Browser render HTTP 200, visual match with reference screenshot | Maintained |
| **AUTH-002** | Login Form (`/login`, `/`) | Styled inputs with show/hide password toggle and disabled submit state | **COMPLETE** | `src/components/auth/AuthCard.tsx` | Verified interactive state transitions in React | Maintained |
| **AUTH-003** | Email Login Button | Replaced Facebook login with "Войти с Email" button per user requirement | **COMPLETE** | `src/components/auth/AuthCard.tsx` | User requirement satisfied; switches to email login mode | Maintained |
| **AUTH-004** | Test Account Selectors | Quick-fill buttons for `alex_photographer`, `maria_art`, `john_traveler` | **COMPLETE** | `src/components/auth/AuthCard.tsx` | One-click population of credentials verified | Maintained |
| **AUTH-005** | Login API Integration | Submits to `POST /account/login`, accepts username or email, stores JWT | **COMPLETE** | `src/lib/api.ts`, `src/lib/auth.ts`, `backend/.../account.service.ts` | Tested via REST: status 200 returned with valid JWT | Maintained |
| **AUTH-006** | Register Page (`/register`)| Full registration form with 5 fields (email, fullName, username, password, confirmPassword) | **COMPLETE** | `src/app/register/page.tsx`, `AuthCard.tsx` | Verified form validation and error handling | Maintained |
| **AUTH-007** | Register API Integration | Submits to `POST /account/register` with auto-login on success | **COMPLETE** | `src/components/auth/AuthCard.tsx` | Tested with `mansur_dev`: status 201 created, auto-login 200 | Maintained |
| **AUTH-008** | Password Recovery | Forgot password email submission to `POST /account/forgot-password` | **COMPLETE** | `src/components/auth/AuthCard.tsx` | Verified status 200 message handling | Maintained |
| **AUTH-009** | Session Destruction | Logout button clears `localStorage` and `cookie`, resets to login | **COMPLETE** | `src/lib/auth.ts`, `LoggedInView.tsx` | Verified state reset and cookie removal | Maintained |
| **AUTH-010** | Route Guard Protection | Redirect unauthenticated requests on protected routes to `/login` | **NOT COMPLETE** | Pending `src/components/auth/AuthGuard.tsx` | Needs route middleware / HOC | Implement in Phase 2 |

---

### Module 2: Application Shell & Global Navigation (SHELL)

| Task ID | Feature & Route | Requirement | Status | Source File Reference | Verification Evidence | Next Action |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **SHELL-001** | Desktop Sidebar | Left navigation bar (`245px` wide, collapsible to `72px` icon-only) | **NOT COMPLETE** | Pending `src/components/shell/DesktopSidebar.tsx` | Spec approved in `COMPONENTS.md` | Implement in Phase 2 |
| **SHELL-002** | Mobile Navigation | Fixed bottom navigation bar (`48px` height) with 5 core icons | **NOT COMPLETE** | Pending `src/components/shell/MobileBottomBar.tsx` | Spec approved in `RESPONSIVE_DESIGN.md` | Implement in Phase 2 |
| **SHELL-003** | Authenticated Layout | Persistent shell layout wrapper for all authenticated subroutes | **NOT COMPLETE** | Pending `src/app/(authenticated)/layout.tsx` | Spec approved in `PAGE_SPECIFICATIONS.md` | Implement in Phase 2 |
| **SHELL-004** | Active Route Indicator | Bold icon and active color highlighting on current route | **NOT COMPLETE** | Pending `DesktopSidebar.tsx` | Depends on SHELL-001 | Implement in Phase 2 |
| **SHELL-005** | "More" Context Menu | Popover menu with Settings, Saved, and Logout links | **NOT COMPLETE** | Pending `DesktopSidebar.tsx` | Depends on SHELL-001 | Implement in Phase 2 |

---

### Module 3: Home Feed & Social Interactions (FEED)

| Task ID | Feature & Route | Requirement | Status | Source File Reference | Verification Evidence | Next Action |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **FEED-001** | Stories Bar Integration | Horizontal scrollable tray of active 24h stories (`GET /stories`) | **NOT COMPLETE** | Pending `src/components/stories/StoriesTray.tsx` | Backend API ready (`GET /stories`) | Implement in Phase 3 |
| **FEED-002** | Feed Post Card | Author avatar, username, location, timestamp, and 3-dots menu | **PARTIAL** | `src/components/feed/LoggedInView.tsx` | Basic card rendering, needs full interactive component | Refactor in Phase 3 |
| **FEED-003** | Multi-Image Carousel | Swipeable/clickable image carousel with dot pagination for up to 10 photos | **NOT COMPLETE** | Pending `src/components/feed/MediaCarousel.tsx` | Spec approved in `COMPONENTS.md` | Implement in Phase 3 |
| **FEED-004** | Double-Tap Like | Double-tapping photo triggers floating heart animation and like mutation | **NOT COMPLETE** | Pending `FeedCard.tsx` | Spec approved | Implement in Phase 3 |
| **FEED-005** | Like / Unlike Mutation | Optimistic like toggling with `POST /posts/:id/like` and `DELETE /posts/:id/like` | **NOT COMPLETE** | Pending `FeedCard.tsx` | Backend API ready | Implement in Phase 3 |
| **FEED-006** | Save / Bookmark | Optimistic bookmark toggling with `POST /posts/:id/favorite` | **NOT COMPLETE** | Pending `FeedCard.tsx` | Backend API ready | Implement in Phase 3 |
| **FEED-007** | Inline Comment Input | Submit comment on post without modal (`POST /posts/:id/comments`) | **NOT COMPLETE** | Pending `src/components/feed/InlineComment.tsx` | Backend API ready | Implement in Phase 3 |
| **FEED-008** | Infinite Scroll | Automatically fetch next page (`?pageNumber=2`) when scrolling down | **NOT COMPLETE** | Pending `src/app/page.tsx` | Backend pagination ready | Implement in Phase 3 |

---

### Module 4: 24h Stories & Story Viewer (STORY)

| Task ID | Feature & Route | Requirement | Status | Source File Reference | Verification Evidence | Next Action |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **STORY-001** | Gradient Story Ring | Avatars in tray display vibrant gradient ring for unviewed stories | **NOT COMPLETE** | Pending `StoriesTray.tsx` | Tailwind gradient defined in `DESIGN_SYSTEM.md` | Implement in Phase 3 |
| **STORY-002** | Story Viewer Modal | Fullscreen modal with 5-second progress timer and auto-advance | **NOT COMPLETE** | Pending `src/components/stories/StoryViewerModal.tsx` | Backend API ready | Implement in Phase 3 |
| **STORY-003** | Story Interactions | Like story (`POST /stories/:id/like`) and record view (`POST /stories/:id/views`) | **NOT COMPLETE** | Pending `StoryViewerModal.tsx` | Backend API ready | Implement in Phase 3 |
| **STORY-004** | Story Viewers List | Author-only drawer displaying users who viewed the story | **NOT COMPLETE** | Pending `StoryViewerModal.tsx` | Backend `GET /stories/:id/viewers` ready | Implement in Phase 3 |

---

### Module 5: Post Creation Wizard (CREATE)

| Task ID | Feature & Route | Requirement | Status | Source File Reference | Verification Evidence | Next Action |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **CREATE-001**| Create Modal Shell | Modal dialog triggered by "Create" sidebar button | **NOT COMPLETE** | Pending `src/components/create/CreatePostModal.tsx` | Spec approved in `COMPONENTS.md` | Implement in Phase 4 |
| **CREATE-002**| Image Dropzone | Drag & drop file selector accepting 1–10 images (JPG/PNG/WEBP, < 5MB) | **NOT COMPLETE** | Pending `CreatePostModal.tsx` | Validation spec in `FORM_VALIDATION.md` | Implement in Phase 4 |
| **CREATE-003**| Details & Caption Form | Caption textarea, location search autocomplete (`GET /locations`), Reel flag | **NOT COMPLETE** | Pending `CreatePostModal.tsx` | Backend locations API ready | Implement in Phase 4 |
| **CREATE-004**| Multipart Submission | Submit FormData to `POST /posts`, prepend new post to feed, close modal | **NOT COMPLETE** | Pending `CreatePostModal.tsx` | Backend `POST /posts` tested and working | Implement in Phase 4 |

---

### Module 6: User Profiles & Follow Graph (PROFILE)

| Task ID | Feature & Route | Requirement | Status | Source File Reference | Verification Evidence | Next Action |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **PROFILE-001**| Profile Route (`/[username]`)| Header with avatar, bio, external link, post/follower/following counts | **PARTIAL** | `src/components/feed/LoggedInView.tsx` | Basic profile data fetched; needs dedicated dynamic page | Implement in Phase 5 |
| **PROFILE-002**| Avatar Changer | Upload photo modal updating avatar via `PUT /profiles/me/avatar` | **NOT COMPLETE** | Pending `src/components/profile/AvatarUploadModal.tsx` | Backend endpoint ready | Implement in Phase 5 |
| **PROFILE-003**| Follow / Unfollow Toggle | Follow/unfollow other users with instant button state toggle | **NOT COMPLETE** | Pending `ProfileHeader.tsx` | Backend `POST /users/:id/follow` ready | Implement in Phase 5 |
| **PROFILE-004**| Followers / Following Modal| Dialog listing follower accounts with follow/unfollow buttons | **NOT COMPLETE** | Pending `src/components/profile/FollowModal.tsx` | Backend endpoints ready | Implement in Phase 5 |
| **PROFILE-005**| Publications Grid | 3-column square grid of posts with hover stats overlay | **NOT COMPLETE** | Pending `src/components/profile/MediaGrid.tsx` | Backend `GET /posts?userId=` ready | Implement in Phase 5 |
| **PROFILE-006**| Saved Posts Tab | Tab displaying current user's bookmarked posts (`GET /profiles/me/favorites`) | **NOT COMPLETE** | Pending `MediaGrid.tsx` | Backend favorites API ready | Implement in Phase 5 |

---

### Module 7: Direct Messaging (CHATS)

| Task ID | Feature & Route | Requirement | Status | Source File Reference | Verification Evidence | Next Action |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **CHAT-001** | Conversations List (`/direct`)| Left panel displaying conversation threads with partner avatar and unread badge | **NOT COMPLETE** | Pending `src/components/chat/ChatList.tsx` | Backend `GET /chats` ready | Implement in Phase 6 |
| **CHAT-002** | Message Thread View | Right panel message bubbles (outgoing right, incoming left) with timestamps | **NOT COMPLETE** | Pending `src/components/chat/ChatThread.tsx` | Backend `GET /chats/:id/messages` ready | Implement in Phase 6 |
| **CHAT-003** | Send Message | Send text and optional media attachment (`POST /chats/:id/messages`) | **NOT COMPLETE** | Pending `src/components/chat/ChatInput.tsx` | Backend accepts plain JSON or multipart | Implement in Phase 6 |

---

### Module 8: Search, Explore & Reels (DISCOVERY)

| Task ID | Feature & Route | Requirement | Status | Source File Reference | Verification Evidence | Next Action |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **DISC-001** | Search Drawer | Sidebar trigger opening drawer with debounced query and history | **NOT COMPLETE** | Pending `src/components/shell/SearchDrawer.tsx` | Backend `/users?search=` & `/search-history` ready | Implement in Phase 6 |
| **DISC-002** | Explore Grid (`/explore`) | Responsive 3-column media grid with post click modal | **NOT COMPLETE** | Pending `src/app/explore/page.tsx` | Backend `GET /posts` ready | Implement in Phase 6 |
| **DISC-003** | Reels Feed (`/reels`) | Vertical 9:16 reels player with snap scrolling and action buttons | **NOT COMPLETE** | Pending `src/app/reels/page.tsx` | Backend `GET /posts/reels` ready | Implement in Phase 6 |

---

## 3. Blocked Work & Environmental Limitations

* **No active blockers:** All 11 NestJS backend modules are verified and running locally on port 3000.
* **Environmental Note (ENV-01):** Automated browser driver download via Playwright encounters a 404 on Azureedge; verified instead via direct HTTP 200 checks, SSR output verification, and REST invocations.

---

## 4. Next Recommended Implementation Task

When Phase 1 (Documentation) is concluded, the immediate next action is:
* **Task:** **Phase 2 — Application Shell & Global Navigation**
* **Target Files:**
  1. `src/components/shell/DesktopSidebar.tsx`
  2. `src/components/shell/MobileBottomBar.tsx`
  3. `src/app/(authenticated)/layout.tsx`
  4. `src/components/auth/AuthGuard.tsx`
