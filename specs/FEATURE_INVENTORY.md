# Feature Inventory & Acceptance Criteria — Instagram Web Clone

> **Document Version:** 2.0 (2026-10-23)
> **Status key:** **DONE** works end to end (verified through the API / BFF) · **API-ONLY** endpoint works, no UI yet · **UI-LATER** works in a basic form, the final design/interaction waits for the UI phase · **TODO** not built.
> Browser-level (click) verification is still open — see `tz.md` §6.1.

## Module 1 — Authentication (AUTH)
- **AUTH-01 DONE** Username **or e-mail** login with password visibility toggle and disabled/loading state.
- **AUTH-02 DONE** "Войти с Email" alternative entry.
- **AUTH-03 DONE** Client validation (required fields, min 6 chars, password match) with zod.
- **AUTH-04 DONE** Login via `POST /api/session` → backend `POST /account/login`; JWT stored in an **httpOnly cookie**, never in `localStorage`.
- **AUTH-05 DONE** Registration (5 fields) with auto-login.
- **AUTH-06 DONE** Forgot / reset password. The reset token is random, expires in 15 minutes and works once. Outside production the API returns it so the flow is usable without e-mail.
- **AUTH-07 DONE** Logout clears the cookies.
- **AUTH-08 DONE** Route guard (`proxy.ts`) + `SessionGuard` (401 → clear cookie → `/login?redirect=`).
- **AUTH-09 DONE** Change password (`/settings/password`).
- **AUTH-10 API-ONLY** Refresh token endpoint (not used by the UI; access token lasts 24 h).

## Module 2 — Shell (SHELL)
- **SHELL-01 DONE** Desktop sidebar: 72 px icon rail, expands to 244 px with labels on hover (design screenshots, 2026-10-23).
- **SHELL-02 DONE** Mobile top bar + bottom bar. **TODO (UI phase):** logout, reels, saved, stories on mobile.
- **SHELL-03 DONE** Active route indicator, theme toggle (light/dark, no flash).
- **SHELL-05 DONE** Interface language switch RU / EN in the sidebar "Ещё" menu (see `I18N.md`).
- **SHELL-04 DONE** Notifications panel (design screenshots, 2026-10-24): filters (all / people you follow / comments / follows / likes), sections (today, yesterday, this week, this month, earlier), follow-back button, post thumbnails. Backed by `GET /notifications`.

## Module 3 — Feed (FEED)
- **FEED-01 DONE** Stories tray.
- **FEED-02 DONE** Post card (author, location, time, delete for the owner).
- **FEED-03 DONE** Multi-image carousel (scroll-snap + arrows + counter).
- **FEED-04 UI-LATER** Double-tap heart animation.
- **FEED-05 DONE** Optimistic like / unlike with rollback.
- **FEED-06 DONE** Optimistic save / unsave.
- **FEED-07 DONE** View counted when the post page opens. (Per-viewport counting is UI-later.)
- **FEED-08 UI-LATER** Collapsible caption.
- **FEED-09 DONE** Comments open in a modal over the feed (picture left, comments right, pinned comment box); the post page keeps its own comment section.
- **FEED-10 UI-LATER** Infinite scroll (currently numbered pagination).
- **FEED-11 DONE** Empty feed message. **UI-LATER:** suggested accounts.

## Module 4 — Post creation (CREATE)
- **CREATE-01 DONE** Create page `/post/new`. **UI-LATER:** modal wizard.
- **CREATE-02 DONE** 1–10 images, JPG/PNG/WEBP ≤ 5 MB, validated before upload. **UI-LATER:** drag & drop.
- **CREATE-03 DONE** Previews and remove. **UI-LATER:** reorder.
- **CREATE-04 DONE** Title and description fields.
- **CREATE-05 DONE** Location select (`GET /locations`). **UI-LATER:** autocomplete.
- **CREATE-06 DONE** "Publish as Reels" flag (`isReel`, fixed in this pass).
- **CREATE-07 DONE** Multipart upload through the BFF proxy.
- **CREATE-08 DONE** Redirect to the new post; lists are refreshed through cache tags.

## Module 5 — Post page and comments (MODAL)
- **MODAL-01 DONE** Post page with card + comments. **UI-LATER:** two-column modal.
- **MODAL-02 DONE** Comment list (first 50) and add.
- **MODAL-03 DONE** Delete comment — comment author or post owner.
- **MODAL-04 API-ONLY** Edit post.

## Module 6 — Stories (STORY)
- **STORY-01 DONE** Tray of authors (**UI-LATER:** viewed/unviewed ring state).
- **STORY-02 DONE** Fullscreen viewer, keyboard (←, →, Esc), auto-advance after 5 s.
- **STORY-03 DONE** Animated progress bar, pause button, hold-to-pause, tap zones (left third = back, rest = next), arrows, keyboard; continues with the next author and closes after the last (design screenshot, 2026-10-23).
- **STORY-04 DONE** Like / unlike.
- **STORY-05 DONE** View recorded when a story opens.
- **STORY-06 DONE** Viewers list for the author (eye button under their own story).
- **STORY-07 DONE** Upload a story (`/stories`).
- **STORY-08 DONE** Delete own story (… menu, confirm by second click).
- **STORY-09 DONE** Reply to a story sends a direct message to the author.

## Module 7 — Profiles (PROFILE)
- **PROFILE-01 DONE** Header in the design layout (2026-10-24): big avatar (ring + opens the stories when the user has any), username with settings icon, full name, counters, bio, link, wide action buttons (own: Редактировать профиль / Сохранённое; other: Подписаться / Написать).
- **PROFILE-10 DONE** "Новая" circle on the own profile: pick a picture and it is published as a story on the spot (no page change); every active story gets its own circle, side by side after it (scrolls sideways when there are many); a click opens the viewer at that story (with delete and viewers). Highlights / archive do not exist.
- **PROFILE-02 DONE** Avatar upload / remove (in the edit page).
- **PROFILE-03 DONE** Follow / unfollow with correct state (fixed in this pass).
- **PROFILE-04 DONE** Followers / following dialogs with follow buttons.
- **PROFILE-05 DONE** Posts grid (own profile now filtered by the owner — fixed).
- **PROFILE-06 DONE** Saved tab.
- **PROFILE-07 DONE** Edit profile (name, username, bio, link, gender, private flag).
- **PROFILE-08 UI-ONLY** Private accounts are hidden in the UI; the backend does not enforce it yet (GAP-6).
- **PROFILE-09 API-ONLY** Delete account.

## Module 8 — Direct messages (CHAT)
- **CHAT-01 DONE** Conversation list in the design layout (header with username, tabs Основные / Общие / Запросы, search, big avatars, last message and time). **TODO:** unread badge; the Общие and Запросы tabs are empty (no such backend concepts).
- **CHAT-02 DONE** Start a chat from a profile or from the "new message" button (search for a person).
- **CHAT-08 DONE** Share a post or reel to one or more people (paper-plane icon on a post / reel opens a "send to" dialog with search, note and copy-link). The recipient sees a preview card of the post in the chat; emoji-only messages are shown large; emoji picker; time separators.
- **CHAT-03 DONE** Thread in chronological order, outgoing/incoming bubbles, image attachments.
- **CHAT-04 DONE** Send text or an image (≤ 5 MB).
- **CHAT-05 DONE** Mark as read when the thread opens.
- **CHAT-06 DONE** Short polling (thread 4 s, list 8 s) — no WebSocket on the backend.
- **CHAT-07 API-ONLY** Delete message / conversation.

## Module 9 — Search and explore (SEARCH)
- **SEARCH-01 DONE** Search page (users + locations), debounced 350 ms, minimum 2 characters. **UI-LATER:** sidebar drawer.
- **SEARCH-02 DONE** History: saved when a result is opened, delete one, clear all.
- **SEARCH-03 DONE** Explore grid (design screenshots, 2026-10-23): 3:4 tiles, 4 columns on wide screens, loads more while scrolling, video and multi-photo badges, likes / comments on hover, tiles open the post.
- **SEARCH-04 DONE** Search mode inside Explore: back arrow, clear button, Recent list (people and texts, remove one, clear all), live user and place results. `/search` opens the same screen.

## Module 10 — Reels (REELS)
- **REELS-01 DONE** Reels from `GET /posts/reels` (up to 100 loaded at once; no infinite loading yet).
- **REELS-02 DONE** One-at-a-time vertical player (scroll snap, wheel / swipe / ↑ ↓ keys / arrow buttons), only the visible reel plays, tap to pause, shared sound switch, like / comments panel / share (copy link) / save / menu, author and caption overlay (design screenshots, 2026-10-23).
- **REELS-03 TODO** Repost and a follow button in the reel (no API / no follow flag on posts).
