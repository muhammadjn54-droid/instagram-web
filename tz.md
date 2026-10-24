# Master Project Progress Checklist — Instagram Web Clone (`tz.md`)

> **Master Progress Tracker:** the authoritative record of what is done, in progress, missing and deferred.
> **Last verified:** 2026-10-23 (functions & bugs pass — no UI work yet).
> **Rule:** every session inspects the real source, runs the checks, and updates this file with truthful evidence before it ends.

---

## 1. Where we are (one paragraph)

The backend (NestJS + TypeORM + SQLite, 11 modules) and the frontend (Next.js 16 + RTK Query + BFF proxy) are both **functionally wired end to end**: every page exists and renders, and every backend endpoint the UI uses was exercised through the real Next.js proxy. The current phase is **"functions & bugs"**. The **UI polish phase has not started** — it begins when the design images are provided. Earlier versions of this file said the app shell and most pages were "NOT COMPLETE"; that was out of date, the code was far ahead of the docs.

## 2. Health summary

| Check | Result | Evidence |
| :--- | :---: | :--- |
| Frontend `tsc --noEmit` | PASS | exit 0 |
| Frontend `eslint src` | PASS | 0 errors |
| Backend `tsc --noEmit` / `nest build` | PASS | exit 0 |
| Backend `vitest run` | PASS | 1/1 (only a smoke test exists) |
| All 19 frontend routes render (SSR) | PASS | HTTP 200 with a session cookie, 307 to `/login` / `/feed` as designed |
| Backend endpoints used by the UI | PASS | ~90 requests incl. multipart uploads, run directly **and** through `/api/backend/*` |
| Authorization (403/401/400 paths) | PASS | other user's post/story/chat → 403, bad file type → 400, extra field → 400, `pageSize>100` → 400 |
| Interactive browser testing (clicks, hover, scroll) | **NOT DONE** | no browser automation available yet — next step, see §6 |

## 3. Bugs found and fixed in this pass

### Security (fixed)
| ID | Problem | Fix |
| :--- | :--- | :--- |
| SEC-01 | **`POST /account/reset-password` accepted any token** — anyone who knew an e-mail could take over the account. The token was also predictable (`reset-token-<userId>`). | Random 48-hex token, only its SHA-256 is stored, 15 min expiry, single use, clears the refresh token. `backend/src/modules/account/account.service.ts`, `entities/user.entity.ts` |
| SEC-02 | `GET /profiles/me/favorites` returned **raw database rows including the author's password hash, e-mail and refresh token**. | Now returns `PostDto` like every other list (`PostsService.findByIds`). |
| SEC-03 | Refresh tokens were `ref-<userId>-<timestamp>` (guessable). `logout` did not actually clear it (`undefined` is ignored by TypeORM). | `randomBytes(32)`; logout/reset set it to `null`. |
| SEC-04 | `GET /users/:id` (public) exposed every user's e-mail. | E-mail only returned to its owner. |

### Backend logic (fixed)
| ID | Problem | Fix |
| :--- | :--- | :--- |
| BUG-B1 | Public routes ignored the token, so `isLikedByMe`, `isFavoriteByMe`, `isFollowing` were **always false** on post detail, explore, profiles, user search, followers lists. The Follow button always showed "Подписаться". | `JwtAuthGuard` now authenticates *optionally* on `@Public()` routes (a bad token never blocks them). |
| BUG-B2 | `isReel=false` (query and multipart field) was treated as `true` (`Boolean("false")`). Filters were wrong, and a post created with the Reel box unticked could still become a Reel. | Explicit string→boolean transform in `post.dto.ts`. |

### Frontend (fixed)
| ID | Problem | Fix |
| :--- | :--- | :--- |
| BUG-F1 | **Own profile showed everybody's posts** (no `userId` filter for `/profile/me`). | Uses the signed-in user's id. |
| BUG-F2 | Console error "script tag while rendering React component" (theme script). `next/script` did not help — it still renders a script element. | No script at all: the theme is stored in the `ig-theme` cookie, the root layout reads it on the server (`src/app/layout.tsx`, `src/lib/theme.ts`, `ThemeSync`, `ThemeToggle`). |
| BUG-F3 | Missing dependencies after pull (`@reduxjs/toolkit`). | `npm install` (run it after every pull). |
| BUG-F4 | Post tiles in Explore / Reels / Profile / Saved were **not clickable**. | `PostGrid` links to `/post/:id`; Saved now reuses it. |
| BUG-F5 | Carousel arrows did nothing (no scroll), and sat inside a link (clicking navigated away). | Arrows scroll the track and stop the link. |
| BUG-F6 | Delete-post was never shown in the feed (`owned` prop never passed); after deleting on the post page the user stayed on a dead page. | `PostCard` checks ownership itself; post page redirects to `/feed` after delete. |
| BUG-F7 | Comment authors could not delete their own comments on other people's posts. | Allowed for comment owner **or** post owner (matches the backend rule). |
| BUG-F8 | "Написать" on a profile only opened the inbox. | Creates/opens the chat (`POST /chats`) and goes to `/messages/:id`. |
| BUG-F9 | Chat thread showed the newest message at the **top** (API returns newest first). No polling although there is no WebSocket. Chat list never updated after sending (wrong cache tag). PDF attach was offered but the backend rejects it. | Reversed to chronological, 4 s thread / 8 s list polling, tags fixed, images only. |
| BUG-F10 | An expired/invalid session could loop forever: `/login` redirects to `/feed` while the cookie exists, `/feed` gets 401 → `/login`… | `SessionGuard` clears the cookie before redirecting. |
| BUG-F11 | RTK Query tags: list queries could not be invalidated by `Post/LIST` (follow, comment, favorite never refreshed lists). The cache of the previous account survived a new login. | Lists provide `LIST`; login/register reset the API cache. |
| BUG-F12 | Image previews in the create form never rendered (`blob:` URLs were prefixed with the backend host). | `media.ts` keeps `blob:`. |
| BUG-F13 | Story viewer closed the parent from inside a state updater (React warning / double close); the viewer showed a stale snapshot (like/view counts frozen). | Direct logic; the viewer reads live data. |
| BUG-F14 | Open-redirect risk in `/login?redirect=`; login page missing `Suspense` for `useSearchParams`. | `safeRedirectPath`, `Suspense`. |
| BUG-F15 | Many error toasts hid the real server message ("Username already taken", "Current password does not match"). Uploads were not validated client-side (backend accepts JPG/PNG/WEBP ≤ 5 MB). | Server message shown; `validateImageFile` in avatar, post, story, chat. |
| BUG-F16 | Private accounts' posts were shown while the page said they were hidden. | Hidden unless owner or follower (UI-level only; see GAP-6). |

## 4. Module checklist (functions only — the UI skin comes later)

Legend: **OK** works end to end · **API-only** the endpoint works but no UI uses it · **GAP** missing function.

| Module | Capability | Status | Notes |
| :--- | :--- | :---: | :--- |
| **AUTH** | login (username or e-mail), register + auto-login, logout, httpOnly session cookie, route guard (`proxy.ts`), forgot/reset password, change password | OK | The reset token is shown in the UI outside production (no mail service). |
| | refresh token | API-only | The access token lives 24 h, then the user logs in again. |
| **LANGUAGE (RU / EN)** | in-app switch under the theme toggle in the sidebar "Ещё" menu; the whole interface (pages, forms, toasts, page titles, relative times) in Russian or English, saved in the `ig-locale` cookie; backend data (names, captions, comments, messages) is never translated; Chrome auto-translate is turned off. See `specs/I18N.md`. | OK | 394 strings. Dynamic server texts `Поле «x» обязательно` / `Ошибка запроса (N)` stay Russian; numbers keep Russian grouping. |
| **NOTIFICATIONS** | panel next to the sidebar with filters, day sections, follow-back, thumbnails; backend `GET /notifications` (follows, likes and comments on my posts, likes on my stories) | OK | No unread badge / read state yet. |
| **SHELL** | sidebar (desktop): 72 px icon rail that expands to 244 px on hover with labels, same on every page; Home, Reels, Messages, Search, Explore, Notifications panel (empty — no API), Create, Profile, "Ещё" menu (settings, password, saved, stories, theme, logout); top bar + bottom nav (mobile); 401 handling | OK | **UI phase has started with the sidebar only (2026-10-23, from the design screenshots).** Mobile has no logout / reels / saved / stories entries — GAP-5. |
| **FEED** | feed, post card, carousel, like/unlike, save, comments, delete post, pagination | OK | Paginated, not infinite scroll (deliberate for now). Double-tap-like is a UI item. |
| **POSTS** | create (1–10 images, location, reel flag), detail, view count | OK | |
| | edit post (`PATCH /posts/:id`) | API-only | GAP-2 |
| **COMMENTS** | list, add, delete (owner / post owner) | OK | |
| **STORIES** | tray, viewer (auto-advance, keys, like, view record), upload | OK | |
| | delete own story, viewers list, reply to a story (as a chat message) | OK | GAP-1 closed 2026-10-23 |
| **PROFILE** | (design layout 2026-10-24) own/other profile, add a story from the "Новая" circle, icon tabs posts / reels / saved, posts grid, saved tab, follow/unfollow, followers/following dialogs, edit profile, avatar upload/remove, change password | OK | |
| | delete account (`DELETE /users/me`) | API-only | GAP-3 |
| **CHAT** | list (design layout), open from profile or via "new message" search, thread, send text / emoji / image, share a post or reel to people, mark read, polling | OK | Shared posts travel as a link in the message text and render as a preview card. Tabs Общие / Запросы are empty placeholders. |
| | delete message / delete conversation | API-only | GAP-4 |
| **SEARCH / EXPLORE** | Explore page (design screenshots): wide search bar + infinite 3:4 grid of all posts and videos (hover shows likes / comments, icons for video and multi-photo); search mode on focus: back arrow, clear button, Recent list (users and texts, remove one, clear all), live results for users and places;  opens the same screen with search active | OK | |
| **SAVED** | grid with pagination, tiles open the post | OK | |
| **REELS** | one-at-a-time vertical player (snap scroll, autoplay of the visible reel, sound switch, like, comments panel, share, save) | OK | Loads up to 100 reels at once; no repost / follow button (no API). |

## 5. Known gaps and risks (not fixed on purpose)

| ID | Item | Why it waits |
| :--- | :--- | :--- |
| GAP-1 | Own-story delete button and viewers list in the story viewer | New feature, needs UI design. |
| GAP-2 | Edit post (caption/location) | New feature, needs UI design. |
| GAP-3 | Delete my account | Destructive — needs a confirmation design. |
| GAP-4 | Delete message / conversation; "new message" search in the inbox | New feature. |
| GAP-5 | Mobile navigation lacks logout, reels, saved, stories; the mobile bell icon does nothing (notifications exist only in the desktop sidebar) | Part of the UI phase. |
| GAP-6 | **Private accounts are enforced only in the UI.** The backend still returns their posts to anyone. | Needs a backend rule (follower check on `GET /posts?userId=`, `/posts/:id`). |
| GAP-7 | `GET /users?search=` also matches e-mail substrings (lets someone probe whether an address is registered). | Decide: drop e-mail from the search. |
| GAP-8 | The reset token is returned by the API outside production (no mail service). With `NODE_ENV=production` it is only written to the server log. | Needs a real mail provider for production. |
| GAP-9 | The dev database `backend/data/app.sqlite` is local (git-ignored). Teammates run `npm run seed` in `backend/` — the seed **wipes** existing data. | Documented in §8. |
| GAP-10 | No automated browser tests yet. | See §6 step 1. |

## 6. Roadmap — what to do next, in order

1. **Browser pass (functions).** Click through every screen with `muhammad_dev` (`Password123!`) and confirm each item in §4 by hand (or add Playwright). Anything wrong goes into §3.
2. **Restart both servers** after pulling (`npm install` in `frontend/` and `backend/`; `npm run seed` in `backend/` if you want the demo users).
3. **Close GAP-6** (backend privacy rule) and decide GAP-7 / GAP-8.
4. **Small missing functions** (GAP-1…GAP-4) — the endpoint already works, only UI wiring is missing.
5. **UI phase:** receive the design images → design tokens → shell → feed → profile → chat → remaining screens; infinite scroll, double-tap-like, reels player, search drawer.
6. Playwright smoke suite + Lighthouse/a11y pass.

## 7. Deferred (out of scope for now)

OAuth / Facebook login, WebSocket chat (polling is used instead), 2FA, video upload/streaming, push notifications, admin tools for locations.

## 8. How to verify quickly

```bash
# backend (port 3000) — first time only: npm run seed
cd backend && npm install && npm run start:dev
# frontend (port 3001)
cd frontend && npm install && npm run dev
# checks
cd frontend && npx tsc --noEmit && npx eslint src
cd backend  && npx tsc --noEmit && npx vitest run
```
Demo data (after `npm run seed` in `backend/`, **wipes the DB**): 42 users, 168 posts (84 photos from Unsplash + 84 video reels with sound from Wikimedia/Mixkit — they are remote URLs, internet is required), stories and chats. Login with `muhammad_dev` (or any seeded user) — password `Password123!`. The seed comes from Muhammad's branch `muhammad`, merged into `abubakr` on 2026-10-23.
