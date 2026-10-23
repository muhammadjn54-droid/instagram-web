# Project Changelog — Instagram Web Clone

All notable changes to the `instagram-monorepo` project are documented in this file (newest first).

---

## [Functions & Bugs pass] — 2026-10-23

Scope: behaviour only, no visual redesign. Details and causes: root `tz.md` §3.

### Security
- Password reset now requires a real token (random, hashed, 15 min, single use) — before, any token worked and anyone could take over an account.
- `GET /profiles/me/favorites` no longer leaks password hashes / e-mails (now `PostDto`).
- Refresh tokens are random; logout and reset really clear them.
- `GET /users/:id` returns the e-mail only to its owner.
- `?redirect=` is restricted to same-site paths.

### Backend
- `JwtAuthGuard`: optional authentication on `@Public()` routes (fixes always-false `isLikedByMe`, `isFavoriteByMe`, `isFollowing`).
- `isReel` accepts `"true"/"false"` correctly (query and multipart).
- New nullable columns on `users`: `resetTokenHash`, `resetTokenExpiresAt` (added automatically by TypeORM `synchronize`).

### Frontend
- Own profile loads only the owner's posts; post tiles open the post; carousel arrows work; delete-post visible for the owner and redirects afterwards; comment authors can delete their comments.
- "Написать" opens/creates the chat; chat thread is chronological and polled; chat/profile/post cache tags fixed; API cache reset on login/register.
- 401 handling clears the stale cookie (no redirect loop); theme script moved to `next/script`; `blob:` previews work.
- Client-side image validation (JPG/PNG/WEBP, 5 MB); real server error messages in toasts.
- Removed the obsolete `FavoritePost` type.

### UI — sidebar (first design-driven change)
- Desktop sidebar rebuilt from the design screenshots: collapsed icon rail (72 px) that expands over the page on hover/keyboard focus (244 px) with labels; active item bold; Notifications flyout; "Ещё" menu with settings, password, saved, stories, theme switch and logout. Shell padding is now `lg:pl-[72px]`. Mobile navigation unchanged.
- Likes: shared `usePostLike` hook (serialised clicks, resync from the server on conflict); lists refresh after a like.

- Story viewer rebuilt from the design screenshot: dark page, centred card, neighbouring authors beside it, next/previous arrows that move through stories and then through authors, reply box (sent as a chat message), like, pause, "…" menu (delete for the owner), viewers list for the owner (closes GAP-1).

- Reels rebuilt from the design screenshots: full-height snap player, one reel at a time, action column, comments side panel, up/down buttons.

- Feed: the comment icon / "all comments" link opens a comments modal instead of navigating to the post page.

- Messages page rebuilt from the design screenshot (full-height two-column layout) with a new-message dialog; "send to…" dialog for posts and reels; shared posts appear as preview cards in the chat.

- Explore and Search rebuilt from the design screenshots: one screen with a wide search bar, an infinite 3:4 post grid, and a search mode (back arrow, clear, Recent with remove / clear all, live results).

- Notifications: new backend endpoint `GET /notifications` (derived from follows, post likes, comments and story likes) and the panel from the design screenshots. Before, the bell was a placeholder because no API existed.

- Profile page rebuilt from the design screenshot: large header, "Новая" story circle, icon tabs (posts / reels / saved), wide infinite 3:4 grid shared with Explore (`PostTile`, `ExploreGrid`).

- Interface language: own RU / EN translator (`src/lib/i18n/*`, 394 strings, cookie `ig-locale`) with a switch in the sidebar "Ещё" menu; page titles, forms, toasts, relative times and the 404 page follow it. Chrome auto-translate stays disabled. Also fixed: the "Повторить" button in error states did nothing (`onRetry` was never attached).

### Demo data and theme
- Merged `origin/muhammad`: seed with 42 users, 84 photo posts, 84 video reels, stories and chats (remote image/video URLs) and the reels player.
- Theme is applied from a cookie on the server — no inline script (fixes the React "script tag" console error).

### Documentation
- Rewritten to match the code: `tz.md`, `frontend/tz.md`, `specs/{BUGS_AND_BLOCKERS,IMPLEMENTATION_PLAN,FEATURE_INVENTORY,ROUTE_INVENTORY,AUTHENTICATION,API_INTEGRATION,SECURITY}.md`, `backend/API_CONTRACT.md`.

---
## [Phase 1: Master Documentation & Specification] — 2026-10-22

### Added
- **`specs/` Documentation Suite (20 Files):**
  - `INSTAGRAM_RESEARCH.md`: Discovery of Instagram web feature areas (A–L).
  - `PROJECT_SCOPE.md`: Explicit in-scope, out-of-scope, and deferred feature breakdown.
  - `ROUTE_INVENTORY.md`: Matrix of 13 identified route patterns with component mappings.
  - `PAGE_SPECIFICATIONS.md`: Layout contracts, responsive grids, and data fetching specs.
  - `FEATURE_INVENTORY.md`: Master feature task list with acceptance criteria.
  - `FRONTEND_ARCHITECTURE.md`: Server/Client boundaries, DAL, and project structure rules.
  - `DESIGN_SYSTEM.md`: Color tokens, gradients, typography, and elevation specs.
  - `COMPONENTS.md`: Reusable component catalog with prop contracts.
  - `API_INTEGRATION.md`: Full endpoint contracts for all 11 backend modules.
  - `AUTHENTICATION.md`: JWT lifecycles, route guards, and test accounts.
  - `STATE_MANAGEMENT.md`: Caching, optimistic UI updates, and invalidation rules.
  - `FORM_VALIDATION.md`: Synchronous client rules and input sanitization.
  - `RESPONSIVE_DESIGN.md`: Viewport breakdown down to 360px mobile width.
  - `ACCESSIBILITY.md`: WCAG 2.1 AA focus rings, contrast, and aria labels.
  - `SECURITY.md`: OWASP defenses, XSS protection, and Multer upload security.
  - `TESTING.md`: QA strategy across static types, build, API, and browser flows.
  - `BUGS_AND_BLOCKERS.md`: Environmental issue workarounds and active dependencies.
  - `IMPLEMENTATION_PLAN.md`: Phased roadmap from Phase 1 through Phase 7.
  - `DECISIONS.md`: Architectural Decision Records (ADR-001 through ADR-005).
  - `CHANGELOG.md`: Chronological record of project milestones.
- **Root Documentation:**
  - `FRONTEND_MASTER.md`: Master architectural guide for future engineering sessions.
  - `about.md`: High-level system overview.
  - `tz.md`: Central persistent progress checklist.

---

## [Milestone: Auth UI & Backend Email Login] — 2026-10-22

### Added
- Created `frontend/src/components/auth/AuthHero.tsx` with Instagram gradient logo, colored headline, and 3D story collage.
- Created `frontend/src/components/auth/AuthCard.tsx` with login, register, email login, and forgot password modes.
- Created `frontend/src/components/auth/AuthFooter.tsx` with localized links.
- Created `frontend/src/app/login/page.tsx` and `frontend/src/app/register/page.tsx`.
- Created `frontend/src/components/feed/LoggedInView.tsx` with user welcome, profile stats, and post feed.
- Created `frontend/src/lib/auth.ts` for token and session storage.

### Changed
- Updated `backend/src/modules/account/account.service.ts` to support login via either username or email.
- Verified end-to-end registration (201) and login (200) with JWT issuance.

---

## [Milestone: Initial Full-Stack Monorepo] — 2026-10-21

### Added
- Completed 11 NestJS backend modules with TypeORM and SQLite.
- Added Swagger documentation at `/swagger` and OpenAPI JSON at `/swagger-json`.
- Added database seed script (`npm run seed`) with 3 test accounts and demo posts.
- Created root `README.md`, `FRONTEND_GUIDE.md`, and `AI_INSTRUCTIONS.md`.
