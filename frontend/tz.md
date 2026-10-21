# TZ — Frontend Technical Specification ("How to Build Instagram on the Web")

| Field | Value |
|---|---|
| System | Instagram-like Social Network — Web Frontend |
| Package | `frontend/` (Next.js monorepo app) |
| Version | v0.1 |
| Date | 2026-10-21 |
| Baseline | `frontend/` @ Next.js `16.4.2`, React `19.3.0`, Tailwind `^4`, Turbopack |
| Backend | `backend/` (NestJS 12 + TypeORM + SQLite), Swagger at `/swagger` and `/api` |
| Status legend | **DONE** shipped · **PARTIAL** scaffolded, incomplete · **TODO** not started |

Priority: **P0** must have · **P1** should have · **P2** nice to have.

> **Read the bundled docs, not your memory.** This Next.js version has breaking
> changes. Before writing code read `frontend/node_modules/next/dist/docs/`
> (see `frontend/AGENTS.md`). In particular: `middleware.ts` is now
> `proxy.ts`, `params`/`searchParams`/`cookies()`/`headers()` are **async
> only**, `unstable_cache` is replaced by `"use cache"`, and `next/image`'s
> `priority` prop is deprecated in favour of `preload`.

---

## 1. Goal

Deliver a production-shaped Instagram-like web client that:

1. Registers / logs in / logs out a user against the NestJS backend.
2. Renders an infinite feed of posts from followed accounts, a reels feed,
   an explore feed, and 24-hour stories.
3. Lets a user publish a post with 1–10 images, like, comment, favourite,
   follow, edit their profile and avatar, upload stories, and send direct
   messages.
4. Never leaks the JWT to the browser bundle (httpOnly cookie + server-side
   Data Access Layer), never renders a request-time API without a Suspense
   boundary, and ships a passing `next build` with zero TypeScript errors.

## 2. Scope

| In scope | Out of scope (this release) |
|---|---|
| Email/password auth, session cookie, logout | OAuth / social login, MFA |
| Feed (following), Explore (all posts), Reels | Recommendation algorithm, ranking |
| Stories: create, view, like, viewers list | Story highlights, live video stories |
| Post create (1–10 images), like, comment, delete | Post editing of images, hashtag pages |
| Profile: view, edit, avatar upload, follower lists | Follower privacy enforcement (backend TODO) |
| Saved posts (favorites) | Collections / folders of saved posts |
| Direct messages (text + one file per message) | WebSocket / push real-time chat |
| User search + search history | Full-text post search (backend filters by `title` only) |
| Location tag on a post | Location CRUD — **the backend has no locations API** |
| Dark mode | i18n / RTL |
| Mobile-responsive layout down to 360 px | Native apps |

## 3. Personas

| Persona | Needs | Success signal |
|---|---|---|
| **P-A Visitor** | Land on the marketing page, understand the product, register | Registers and lands on the empty feed with a CTA to follow people |
| **P-B New user** | Register, upload a first photo, follow accounts, find people | First post published within 3 minutes |
| **P-C Returning user** | Open the feed fast, read DMs, upload a story | Feed paints in < 1.5 s on a warm cache |
| **P-D Creator** | Publish reels, watch story views, grow followers | Reel published + views visible |

## 4. Tech stack (already installed — do not change without an ADR)

| Concern | Choice | Version in `frontend/package.json` |
|---|---|---|
| Framework | Next.js App Router, Turbopack | `16.4.2` |
| UI runtime | React | `19.3.0` |
| Language | TypeScript, `strict: true` | `^5` |
| Styling | Tailwind CSS v4 via `@tailwindcss/turbopack` | `^4` |
| Lint | ESLint flat config (`eslint.config.mjs`), `eslint-config-next` | `16.4.2` |
| Fonts | `next/font/google` (Geist, Geist Mono — already in `layout.tsx`) | — |
| Path alias | `@/*` → `./src/*` (see `tsconfig.json`) | — |

Runtime requirements: **Node.js ≥ 20.9**, TypeScript ≥ 5.1, Chrome/Edge/Firefox
≥ 111, Safari ≥ 16.4.

### Explicitly NOT in the stack

No `next lint` (removed in v16 — use the `eslint` CLI, already wired as
`npm run lint`), no Pages Router, no `middleware.ts`, no `experimental.ppr` /
`dynamicIO` (superseded by the top-level `cacheComponents` flag), no
`next/legacy/image`, no `unstable_cache`, no `images.domains`.

## 5. Environment

| Variable | Scope | Value (dev) | Purpose |
|---|---|---|---|
| `API_BASE_URL` | server only | `http://localhost:3000` | NestJS API root, used by the DAL |
| `NEXT_PUBLIC_APP_URL` | public | `http://localhost:3001` | Canonical URL for metadata, OG images, sitemap |
| `SESSION_SECRET` | server only | `openssl rand -base64 32` | Signs/encrypts the session cookie |
| `JWT_SECRET` (backend) | server only | backend's own | Backend signs access tokens |

The backend defaults to port **3000**, so the frontend must run on **3001**
(`npm run dev -- -p 3001`). Full rules: `docs/ENVIRONMENT.md`.

## 6. Repository layout

```
frontend/
├── proxy.ts                      # optimistic auth redirect (NOT middleware.ts)
├── next.config.ts                # cacheComponents + partialPrefetching
├── src/
│   ├── app/
│   │   ├── layout.tsx            # root layout: <html>, fonts, providers
│   │   ├── globals.css           # Tailwind v4 entry + theme tokens
│   │   ├── error.tsx             # route-level error boundary (Client Component)
│   │   ├── not-found.tsx         # 404
│   │   ├── (auth)/               # login, register, forgot-password
│   │   ├── (main)/               # feed, explore, reels, messages, profile
│   │   └── api/                  # Route Handlers used by the client (if any)
│   ├── components/
│   │   ├── ui/                   # primitives: Button, Input, Avatar, Dialog…
│   │   ├── layout/               # TopBar, Sidebar, MobileNav
│   │   ├── feed/ post/ story/ chat/ profile/ search/
│   │   └── providers/             # ThemeProvider, ToastProvider
│   ├── lib/
│   │   ├── api/                  # typed HTTP client + endpoint map
│   │   ├── dal/                  # server-only Data Access Layer (one module per resource)
│   │   ├── auth/                 # session.ts, password.ts (bcrypt/argon2 hash)
│   │   ├── validation/           # zod schemas shared by forms and actions
│   │   ├── types/                # DTO mirrors of the backend response shapes
│   │   └── utils/                # cn(), formatters, relative time
│   ├── actions/                  # "use server" server actions, one file per domain
│   ├── hooks/                    # client hooks only
│   └── styles/                   # fonts.ts + CSS modules
└── docs/                         # this documentation set
```

Rules for the layout: `docs/ARCHITECTURE.md`, `docs/CODING_RULES.md`.

## 7. Architectural decisions (ADRs)

### ADR-001 — The JWT never reaches the browser

`POST /account/login` returns `{ accessToken, refreshToken, expiresAt, user }`.
The token is stored **server-side** and only a **signed, httpOnly, SameSite=Lax
cookie** (`ig_session`) is sent to the browser. Every API call the browser
triggers is proxied by a Server Action or Route Handler that attaches
`Authorization: Bearer <accessToken>` from the cookie.

*Why:* an httpOnly cookie is not readable by JavaScript, so an XSS bug cannot
exfiltrate the bearer token. This is the pattern the bundled Next.js
authentication guide recommends (server-only DAL + cookie session).

*Consequence:* the browser cannot call the NestJS API directly with the bearer
token. `NEXT_PUBLIC_API_BASE_URL` therefore does not exist — all traffic goes
through the Next.js server. See `docs/AUTH.md`.

### ADR-002 — One DAL, one place that talks to the API

`src/lib/dal/**` is the **only** place that calls `API_BASE_URL`. It is
imported with `import "server-only"`. Components and pages never call `fetch`
against the NestJS API directly; they call a DAL function.

*Why:* keeps auth, error mapping, DTO mapping and cache tags in one place and
makes the app testable without mocking `fetch` in 40 components.

### ADR-003 — Cache Components, not `revalidate` numbers

`next.config.ts` already sets `cacheComponents: true` and
`partialPrefetching: true`. Public, read-mostly data (explore feed, reels,
post detail, public profile) is fetched inside a `"use cache"` boundary with
`cacheLife()` and `cacheTag()`. Personalised data (own feed, own profile,
messages, favourites) is fetched per request, behind a `<Suspense>` boundary.

*Why:* the feed of followed accounts is user-specific and must never be shared
across users; the explore feed is public and identical for everyone.

### ADR-004 — Mutations are Server Actions

Like, unlike, comment, follow, unfollow, favourite, delete post, upload story,
send message — all are `"use server"` actions. They call the DAL, then
`updateTag()` / `revalidatePath()` so the affected surfaces refresh.

*Why:* keeps the bearer token on the server, gives progressive enhancement
(the form submits without JS), and centralises validation.

### ADR-005 — No client-side global state library

Server state lives on the server (React Server Components + cache). The only
client state is ephemeral UI state (open dialog, active tab, optimistic
counter) held with `useState`/`useReducer` inside the component that owns it.
No Redux/Zustand/Jotai is introduced for server data.

*Why:* a second cache duplicates the framework's cache and creates two sources
of truth. If a client store is later unavoidable it must be justified in an ADR.

### ADR-006 — Uploads go through the server, never direct-to-backend

`multipart/form-data` posts (post images, avatar, story image, chat file) are
sent from the browser to a **Next.js Route Handler** (`/api/upload/...`), which
re-serialises the file to the backend. The browser never receives the backend
URL for uploads.

*Why:* the backend needs the `Authorization` header, and the browser cannot
produce it (ADR-001).

### ADR-007 — The backend is not ready; the UI must degrade

Today `backend/src/app.module.ts` imports **only** `AccountModule`. The
posts/profiles/follows/comments/favorites/stories/users/search-history/chats
modules exist but are **not mounted**, so those routes answer `404`. The
response interceptor, the global JWT guard and the exception filter are
**defined but never registered**, so responses are currently *not* wrapped in
`{ statusCode, data, errors }` and no route is actually protected.

The frontend therefore ships against the **documented contract**
(`docs/API_CONTRACT.md`) and must:

* tolerate a response that is *either* the envelope *or* a bare payload;
* show a friendly "backend not connected" state instead of a stack trace when
  a route answers 404;
* never assume an unauthenticated request fails — re-check the session in the
  DAL.

A `docs/BACKEND_READINESS.md` checklist tracks the backend work the frontend is
blocked on.

## 8. Functional requirements

| ID | Requirement | Area | P | Status |
|---|---|---|---|---|
| FE-001 | Registration form: userName, fullName, email, password, confirmPassword | Auth | P0 | TODO |
| FE-002 | Password confirmation must match before submit; min length 6 | Auth | P0 | TODO |
| FE-003 | Login form posts to `/account/login`, stores the session cookie | Auth | P0 | TODO |
| FE-004 | Logout clears the cookie and redirects to `/login` | Auth | P0 | TODO |
| FE-005 | Forgot + reset password screens wired to `/account/forgot-password` and `/account/reset-password` | Auth | P1 | TODO |
| FE-006 | Redirect a signed-in user away from `/login` and `/register` | Auth | P0 | TODO |
| FE-007 | Protected routes redirect to `/login?next=<path>` when there is no session | Auth | P0 | TODO |
| FE-008 | Root layout renders the top bar + sidebar when signed in, a marketing nav otherwise | Layout | P0 | TODO |
| FE-009 | Feed page lists posts of followed accounts, newest first, paginated | Feed | P0 | TODO |
| FE-010 | Feed supports infinite scroll with a "load more" fallback | Feed | P1 | TODO |
| FE-011 | Explore page lists all public posts, newest first | Feed | P0 | TODO |
| FE-012 | Reels page lists `isReel = true` posts | Feed | P0 | TODO |
| FE-013 | Post card shows author, images, caption, like/comment/favourite counts | Post | P0 | TODO |
| FE-014 | Post card shows 1 image, a 2-up grid, or a 3+ carousel | Post | P0 | TODO |
| FE-015 | Like / unlike toggles the count and the heart state | Post | P0 | TODO |
| FE-016 | Favourite / unfavourite toggles the saved state | Post | P0 | TODO |
| FE-017 | Comments panel: list, post a comment, delete own comment | Post | P0 | TODO |
| FE-018 | Post detail route `/post/[id]` shows one post + its comments | Post | P0 | TODO |
| FE-019 | Delete own post with a confirmation dialog | Post | P1 | TODO |
| FE-020 | Create post: 1–10 images, optional caption and location id | Post | P0 | TODO |
| FE-021 | Image picker validates count (1–10) and type (jpg/jpeg/png/webp) | Post | P0 | TODO |
| FE-022 | Image picker validates size (≤ 5 MB per file) before upload | Post | P0 | TODO |
| FE-023 | Create post uploads the files, then creates the post with the returned URLs | Post | P0 | TODO |
| FE-024 | Stories bar on the feed shows stories of followed users, grouped by user | Story | P0 | TODO |
| FE-025 | Story viewer opens full-screen, auto-advances, supports like and views | Story | P0 | TODO |
| FE-026 | Create story: one image, optional link to a post | Story | P0 | TODO |
| FE-027 | Own stories expire 24 h after creation and disappear from the list | Story | P0 | TODO |
| FE-028 | Profile page shows avatar, bio, website, counts, and the post grid | Profile | P0 | TODO |
| FE-029 | Profile page shows the follow/unfollow button and follower/following lists | Profile | P0 | TODO |
| FE-030 | Edit own profile: fullName, userName, bio, website, gender, private flag | Profile | P1 | TODO |
| FE-031 | Avatar upload and removal from the profile page | Profile | P1 | TODO |
| FE-032 | Search users by name and record the query in the search history | Search | P1 | TODO |
| FE-033 | Search history panel: list, click to re-run, delete one, clear all | Search | P1 | TODO |
| FE-034 | Messages page lists chats ordered by `updatedAt` | Chat | P0 | TODO |
| FE-035 | Chat thread shows messages oldest→newest, own messages aligned right | Chat | P0 | TODO |
| FE-036 | Send a text message and optionally one file | Chat | P0 | TODO |
| FE-037 | Delete own message and delete the conversation | Chat | P1 | TODO |
| FE-038 | Saved posts page lists favourites | Profile | P1 | TODO |
| FE-039 | 404 page, route-level error boundary, and per-route loading skeletons | UX | P0 | TODO |
| FE-040 | Dark mode with a persisted preference, no flash on first paint | UX | P1 | TODO |
| FE-041 | Every interactive element is keyboard reachable with a visible focus ring | A11y | P0 | TODO |
| FE-042 | Images have meaningful `alt`; decorative images use `alt=""` | A11y | P0 | TODO |
| FE-043 | `next build` passes with 0 TypeScript errors and 0 lint errors | Quality | P0 | TODO |
| FE-044 | The app renders meaningfully with JavaScript disabled for read-only pages | Resilience | P2 | TODO |

## 9. Non-functional requirements

Full list with numbers in `docs/PERFORMANCE.md`, `docs/SECURITY.md` and
`docs/ACCESSIBILITY.md`. Headlines:

* LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 on a mid-range Android over 4G.
* Initial JS ≤ 120 kB gzip for the feed route.
* No image wider than 1280 px served to a phone.
* Every request-time API read is inside a `<Suspense>` boundary.
* The session cookie is `httpOnly`, `Secure` in production, `SameSite=Lax`.
* No token, password or secret in `localStorage`, in a query string, or in the
  client bundle.
* WCAG 2.1 AA for colour contrast, focus visibility, form labels.

## 10. Data requirements

The frontend mirrors the backend DTOs in `src/lib/types/**`. All ids are
**integers** (auto-increment), not UUIDs. All dates are ISO strings
(`createdAt`, `updatedAt`).

| Type | Key fields | Source |
|---|---|---|
| `PostDto` | `id`, `userId`, `userName`, `userAvatar`, `title?`, `content`, `images: string[]`, `location?`, `likesCount`, `commentsCount`, `viewsCount`, `isLikedByMe`, `isFavoriteByMe`, `isReel`, `createdAt` | `GET /posts`, `POST /posts` |
| `ProfileDetailDto` | `userId`, `userName`, `fullName`, `bio`, `avatar`, `website`, `gender`, `isPrivate`, `followersCount`, `followingCount`, `postsCount`, `isFollowing` | `GET /profiles/:userId` |
| `UserListItemDto` | `id`, `userName`, `fullName`, `avatar`, `followersCount`, `isFollowing` | `GET /users` |
| `CommentDto` | `id`, `postId`, `userId`, `userName`, `userAvatar`, `content`, `createdAt` | `GET /posts/:postId/comments` |
| `StoryDto` | `id`, `userId`, `userName`, `userAvatar`, `imageUrl`, `postId?`, `likesCount`, `viewsCount`, `isLikedByMe`, `expiresAt`, `createdAt` | `GET /stories` |
| `ChatListItemDto` | `id`, `otherUser{id,userName,fullName,avatar}`, `lastMessage?`, `createdAt`, `updatedAt` | `GET /chats` |
| `MessageDto` | `id`, `chatId`, `senderId`, `senderName`, `senderAvatar`, `text?`, `fileUrl?`, `isRead`, `createdAt` | `GET /chats/:chatId/messages` |

Pagination is always `{ pageNumber, pageSize }` in and
`{ items, totalCount, pageNumber, pageSize, totalPages }` out. `pageSize` is
capped at 100 by the backend.

## 11. API requirements

* The backend envelope is `{ statusCode, data, errors }` with `errors: string[]`.
  See `docs/API_CONTRACT.md` for every route the frontend calls.
* The frontend talks to the backend **only** through `src/lib/api/**` and
  `src/lib/dal/**`.
* Pagination params: `pageNumber` (≥ 1, default 1), `pageSize` (1–100,
  default 10).
* Uploads: `multipart/form-data`, ≤ 5 MB per file, `jpg|jpeg|png|webp` only.
  Field names — posts `images` (array, ≤ 10), avatar `image`, story `image`,
  chat file `file`.
* The comment body field is `comment`; the comment response field is `content`.
  This asymmetry is a backend quirk — do not "fix" it in the UI by renaming.

## 12. Business rules (frontend-observable)

1. A story is visible for exactly 24 h; the UI hides it after `expiresAt`.
2. A user cannot follow themselves → the UI hides the button on the own profile.
3. Only the owner can delete a post, story, comment, message or chat → the UI
   shows destructive actions only when `userId` matches the session user.
4. `password` must equal `confirmPassword` → the register form blocks submit.
5. `userName` and `email` are unique → a 409 is surfaced as a field error.
6. A post can be liked, viewed or favourited once per user → the UI toggles,
   it never sends a second request for the same direction.
7. A chat exists once per pair of users → "start chat" re-opens the existing
   conversation instead of creating a duplicate.
8. A post needs at least one image → the create form blocks submit.
9. A comment is 1–500 characters → the textarea enforces the maximum.
10. The current user id always comes from the session, never from user input.

## 13. Page and route map

| Route | Access | Rendering | Purpose |
|---|---|---|---|
| `/` | public | Server | Marketing landing; signed-in users are sent to `/feed` |
| `/login` | public | Server + Client form | Sign in |
| `/register` | public | Server + Client form | Sign up |
| `/forgot-password` | public | Server + Client form | Request a reset link |
| `/reset-password` | public | Server + Client form | Set a new password with a token |
| `/feed` | private | Server (Suspense) | Posts from followed accounts |
| `/explore` | public | Server (Suspense) | All public posts + search |
| `/reels` | private | Server (Suspense) | Reels only |
| `/stories` | private | Server (Suspense) | Own stories + story viewer |
| `/messages` | private | Server (Suspense) | Chat list |
| `/messages/[chatId]` | private | Server (Suspense) | One conversation |
| `/profile/[userName]` | public | Server (Suspense) | A user profile |
| `/profile/me/edit` | private | Server + Client form | Edit own profile |
| `/saved` | private | Server (Suspense) | Favourite posts |
| `/post/[id]` | public | Server (Suspense) | One post + comments |
| `/post/new` | private | Server + Client form | Create a post |
| `/search` | private | Server (Suspense) | User search + history |

Route-group layout:

* `(auth)` — centred card layout, no sidebar.
* `(main)` — top bar + sidebar + mobile bottom nav.

Full rules: `docs/PAGE_ROUTES.md`.

## 14. Component map

| Area | Components |
|---|---|
| `ui/` | `Button`, `IconButton`, `Input`, `Textarea`, `Select`, `Avatar`, `Badge`, `Dialog`, `Drawer`, `Skeleton`, `Spinner`, `Tabs`, `Toast`, `Tooltip`, `EmptyState`, `ErrorState`, `ImageUploader`, `InfiniteScroll` |
| `layout/` | `TopBar`, `Sidebar`, `MobileNav`, `PageShell`, `AuthShell` |
| `feed/` | `FeedList`, `FeedItem`, `FeedEmpty`, `StoriesTray`, `StoryBubble` |
| `post/` | `PostCard`, `PostHeader`, `PostMedia`, `PostCarousel`, `PostActions`, `PostCaption`, `CommentList`, `CommentForm`, `CreatePostForm` |
| `story/` | `StoryViewer`, `StoryProgress`, `StoryComposer` |
| `chat/` | `ChatList`, `ChatListItem`, `ChatThread`, `MessageBubble`, `MessageComposer` |
| `profile/` | `ProfileHeader`, `ProfileTabs`, `PostGrid`, `EditProfileForm`, `FollowButton`, `FollowersDialog` |
| `search/` | `SearchBar`, `SearchResults`, `SearchHistory` |
| `providers/` | `ThemeProvider`, `ToastProvider`, `SessionProvider` |

Inventory and contracts: `docs/COMPONENTS.md`.

## 15. Build order (how to actually implement this)

Each step is independently shippable and ends with a manual check in the
browser.

| Step | Deliverable | Verify with |
|---|---|---|
| 1 | Foundation: design tokens, `ui/` primitives, `layout.tsx` skeleton, fonts, dark mode | Storybook-less manual page; `npm run lint` |
| 2 | API layer: `lib/api/client.ts`, `lib/types/**`, `lib/dal/**` skeleton, envelope tolerance | A unit test that parses one real response |
| 3 | Auth: session cookie, login/register/forgot/reset forms, `proxy.ts` redirect, logout | `docs/AUTH.md` checklist |
| 4 | Shell: `(main)` layout, top bar, sidebar, mobile nav, navigation wiring | Click through every nav item |
| 5 | Profile: public profile page, own profile, follow/unfollow, follower lists | `docs/TESTING.md` §3 |
| 6 | Post: create post with uploads, feed, explore, reels, post detail, like, favourite, comment, delete | `docs/TESTING.md` §3 |
| 7 | Stories: tray, viewer, composer, like, viewers | 24 h expiry simulation |
| 8 | Chat: chat list, thread, send text/file, delete | Two browsers, two accounts |
| 9 | Search: users, history | `docs/TESTING.md` §3 |
| 10 | Polish: loading skeletons, empty/error states, SEO, a11y audit, performance budget | `docs/DEFINITION_OF_DONE.md` |

## 16. Acceptance criteria

| ID | Criterion |
|---|---|
| AC-01 | `npm run build` finishes with 0 TypeScript errors and 0 lint errors |
| AC-02 | A new user can register, is signed in, and lands on `/feed` |
| AC-03 | Reloading `/feed` after signing in keeps the user signed in (cookie session) |
| AC-04 | `localStorage`, `sessionStorage` and the JS bundle contain no JWT |
| AC-05 | Visiting `/feed` signed out redirects to `/login?next=%2Ffeed` |
| AC-06 | Visiting `/login` signed in redirects to `/feed` |
| AC-07 | The feed renders posts newest-first with the author, media and counts |
| AC-08 | Creating a post with 2 images shows both images in the feed |
| AC-09 | The like button updates the count and survives a page reload |
| AC-10 | A comment posted on a post appears in the comment panel |
| AC-11 | A story uploaded now is visible in the stories tray and disappears after 24 h |
| AC-12 | A message sent in a chat appears in the thread for both accounts |
| AC-13 | Uploading a 6 MB PNG is blocked before the request leaves the browser |
| AC-14 | Uploading 11 images is blocked before the request leaves the browser |
| AC-15 | Every page has a `loading.tsx` skeleton and an `error.tsx` boundary |
| AC-16 | The whole UI is reachable with the keyboard alone, focus is always visible |
| AC-17 | Images have `alt` text; `next/image` is used for every content image |
| AC-18 | The JWT is never present in the HTML payload, only in an httpOnly cookie |
| AC-19 | `npm run lint` reports 0 problems |
| AC-20 | Lighthouse on `/feed`: performance ≥ 90, accessibility ≥ 95 |

## 17. Risks, assumptions, constraints

| ID | Risk | Mitigation |
|---|---|---|
| R-01 | The backend has almost no route mounted; the UI cannot be end-to-end tested yet | `docs/BACKEND_READINESS.md`; the DAL returns typed "backend unavailable" errors; UI shows a clear state |
| R-02 | The response envelope is not registered globally, so responses arrive bare | The client accepts both shapes (`docs/API_CONTRACT.md` §2) |
| R-03 | The backend `refreshToken` is not a real JWT (it is `ref-<id>-<ts>`) | The frontend refreshes by re-logging-in, not by refreshing a token |
| R-04 | `posts` upload is `multipart` with an `images` array; the other uploads use a single `image` | One upload helper per field name, see `docs/MEDIA.md` |
| R-05 | Cache Components makes a page dynamic the moment it reads a request API | Rule: request APIs only inside `<Suspense>`-wrapped leaves (`docs/DATA_FETCHING.md`) |
| R-06 | `cacheComponents` forbids `export const dynamic`/`revalidate` | Use `"use cache"` + `cacheLife()` + `cacheTag()` |
| R-07 | The backend serves uploads from `/uploads/...`; `next/image` needs `remotePatterns` | Configured in `next.config.ts` (`docs/MEDIA.md`) |
| R-08 | `next/image` `quality` values are restricted to `images.qualities` (default `[75]`) | Only use `quality={75}` or omit it |
| R-09 | Locations have no API, only a `locationId` on a post | The UI offers a free-text location id field, clearly labelled as temporary |

Assumptions: the backend will register the global interceptor/guard and mount
the missing modules before the integration milestone; the JWT secret is shared
through the environment, never through code; SQLite is enough for the demo.

Constraints: no microservices, no `any` in TypeScript, one directory per
feature, the DAL is the only outbound network client, documentation tasks must
not change business logic.

## 18. Open questions

| ID | Question | Blocks | Owner |
|---|---|---|---|
| Q-01 | Does the backend keep serving uploads from `/uploads` in production, or will media move to object storage? | `docs/MEDIA.md` | backend |
| Q-02 | Will the backend expose a refresh-token endpoint that issues a real JWT? | session lifetime | backend |
| Q-03 | Should private accounts be enforced on the feed (`isPrivate`)? | feed rules | backend |
| Q-04 | Is `post.content` the caption and `post.title` a short heading, or the reverse? | copy, layout | product |
| Q-05 | Do we ship a `GET /locations` endpoint, or is the location tag a free-text id? | create-post form | backend |
| Q-06 | Is a "close friends" story list in scope? | stories | product |
| Q-07 | Do we need a desktop (≥ 1024 px) three-column layout or is a single centred column enough? | layout | design |

## 19. Documentation map

| Document | Read it when you need to… |
|---|---|
| [`tz.md`](./tz.md) | know the scope, the plan and the acceptance criteria |
| [`docs/PRD.md`](./docs/PRD.md) | know the product goals and the user journeys |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | decide where a file goes |
| [`docs/PAGE_ROUTES.md`](./docs/PAGE_ROUTES.md) | add or change a route |
| [`docs/COMPONENTS.md`](./docs/COMPONENTS.md) | build or reuse a component |
| [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md) | use a colour, a radius, a spacing step |
| [`docs/API_CONTRACT.md`](./docs/API_CONTRACT.md) | call a backend endpoint |
| [`docs/AUTH.md`](./docs/AUTH.md) | touch sessions, cookies or the proxy |
| [`docs/DATA_FETCHING.md`](./docs/DATA_FETCHING.md) | fetch or cache server data |
| [`docs/SERVER_ACTIONS.md`](./docs/SERVER_ACTIONS.md) | write a mutation |
| [`docs/FORMS.md`](./docs/FORMS.md) | build a form with validation |
| [`docs/STATE_MANAGEMENT.md`](./docs/STATE_MANAGEMENT.md) | decide where state lives |
| [`docs/STYLING.md`](./docs/STYLING.md) | style a component |
| [`docs/MEDIA.md`](./docs/MEDIA.md) | upload or display an image |
| [`docs/ACCESSIBILITY.md`](./docs/ACCESSIBILITY.md) | audit accessibility |
| [`docs/PERFORMANCE.md`](./docs/PERFORMANCE.md) | check the performance budget |
| [`docs/SEO.md`](./docs/SEO.md) | add metadata or an OG image |
| [`docs/SECURITY.md`](./docs/SECURITY.md) | handle anything sensitive |
| [`docs/TESTING.md`](./docs/TESTING.md) | write a test or run the manual checklist |
| [`docs/ENVIRONMENT.md`](./docs/ENVIRONMENT.md) | add an environment variable |
| [`docs/CODING_RULES.md`](./docs/CODING_RULES.md) | write code that passes review |
| [`docs/ROADMAP.md`](./docs/ROADMAP.md) | see what is next |
| [`docs/DEFINITION_OF_DONE.md`](./docs/DEFINITION_OF_DONE.md) | check whether a task is finished |
| [`docs/GLOSSARY.md`](./docs/GLOSSARY.md) | look up a term |
| [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md) | fix a build or runtime error |
| [`docs/BACKEND_READINESS.md`](./docs/BACKEND_READINESS.md) | see what the backend still owes us |
