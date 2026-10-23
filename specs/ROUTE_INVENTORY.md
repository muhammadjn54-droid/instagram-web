# Route Inventory — Instagram Web Clone

> **Document Version:** 2.0 (2026-10-23) — rewritten to match the real routes in `frontend/src/app/**`.
> **Framework:** Next.js 16 App Router. Route groups: `(auth)` public, `(app)` authenticated.
> **Guard:** `src/proxy.ts` redirects visitors without the session cookie to `/login?redirect=…` and signed-in users away from the auth pages to `/feed`.

## 1. Pages

| Route | Group | Component | Main API calls | Status |
| :--- | :---: | :--- | :--- | :---: |
| `/` | — | `app/page.tsx` | redirects to `/feed` | OK |
| `/login` | (auth) | `LoginForm` | `POST /api/session` → `POST /account/login` (username or e-mail) | OK |
| `/register` | (auth) | `RegisterForm` | `POST /api/session/register` → register + login | OK |
| `/forgot-password` | (auth) | `ForgotPasswordForm` | `POST /account/forgot-password` | OK |
| `/reset-password` | (auth) | `ResetPasswordForm` | `POST /account/reset-password` | OK |
| `/feed` | (app) | `FeedView`, `StoriesTray`, `PostCard` | `GET /posts/feed`, `GET /stories`, like/favorite endpoints | OK |
| `/explore` | (app) | `ExploreView`, `ExploreGrid`, `SearchPanel` | `GET /posts` (infinite), `GET /users`, `GET /locations`, `/search-history` | OK |
| `/reels` | (app) | `ReelsView` | `GET /posts/reels` | OK (grid) |
| `/stories` | (app) | `StoriesView`, `StoryViewer` | `GET /stories`, `POST /stories`, like/view | OK |
| `/saved` | (app) | `SavedView` | `GET /profiles/me/favorites` | OK |
| `/search` | (app) | `SearchView` → `ExploreView startInSearch` | same as `/explore`, with the search field focused | OK |
| `/messages` | (app) | `MessagesView` | `GET /chats` (polling) | OK |
| `/messages/[chatId]` | (app) | `MessageThread` | `GET/POST /chats/:id/messages`, `PATCH /chats/:id/read` | OK |
| `/post/new` | (app) | `PostCreateForm` | `POST /posts` (multipart), `GET /locations` | OK |
| `/post/[postId]` | (app) | `PostDetail`, `CommentSection` | `GET /posts/:id`, comments, `POST /posts/:id/view` | OK |
| `/profile/me` | (app) | `ProfileView` | `GET /profiles/me`, `GET /posts?userId=`, favorites | OK |
| `/profile/me/edit` | (app) | `ProfileEditForm` | `PATCH /profiles/me`, avatar `PUT/DELETE` | OK |
| `/profile/[userId]` | (app) | `ProfileView`, `FollowersDialog` | `GET /profiles/:id`, follow/unfollow, followers/following | OK |
| `/settings/password` | (app) | `PasswordForm` | `PUT /account/change-password` | OK |
| `*` | — | `not-found.tsx`, `error.tsx`, `loading.tsx` | — | OK |

## 2. Internal Next.js endpoints (BFF)

| Route | Purpose |
| :--- | :--- |
| `POST /api/session` | login: calls the backend, stores `access` / `refresh` / `user` httpOnly cookies |
| `GET /api/session` | current session from the cookie |
| `DELETE /api/session` | logout: calls `POST /account/logout`, clears cookies |
| `POST /api/session/register` | register then log in |
| `ALL /api/backend/[...path]` | proxy to NestJS; attaches `Authorization: Bearer` from the cookie; forwards multipart bodies untouched |

## 3. Differences from the original plan

* The plan used `/direct`, `/[username]`, `/p/[postId]`, `/accounts/edit`. The implementation uses `/messages`, `/profile/[userId]`, `/post/[postId]`, `/profile/me/edit` — profiles are addressed by **numeric user id**, because the backend has no lookup by username.
* Search is a page (`/search`), not a sidebar drawer — drawer is a UI-phase item.
* Story viewing opens a modal from the tray / `/stories`, not a dedicated route.
