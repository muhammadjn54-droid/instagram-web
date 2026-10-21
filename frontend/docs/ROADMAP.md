# ROADMAP

| Field | Value |
|---|---|
| Date | 2026-10-21 |
| Related | `../tz.md` §15, `PRD.md` §5, `DEFINITION_OF_DONE.md` |

## 1. Milestones

### M0 — Foundation

**Goal:** an empty app with the design system, the API layer and the auth.

| # | Task | P | Depends on |
|---|---|---|---|
| 0.1 | Design tokens in `globals.css` (`@theme inline`, light + dark) | P0 | — |
| 0.2 | `src/styles/fonts.ts` with one Geist instance | P0 | — |
| 0.3 | `ui/` primitives: Button, Input, Textarea, Avatar, Dialog, Skeleton, Spinner, EmptyState, Toast | P0 | 0.1 |
| 0.4 | `lib/utils/cn.ts` (`clsx` + `tailwind-merge`) | P0 | — |
| 0.5 | `lib/types/**` — the DTO mirrors from `API_CONTRACT.md` §6 | P0 | — |
| 0.6 | `lib/api/client.ts`, `endpoints.ts`, `errors.ts` | P0 | 0.5 |
| 0.7 | `lib/validation/**` with zod | P0 | — |
| 0.8 | `lib/auth/session.ts` + `proxy.ts` | P0 | 0.6 |
| 0.9 | `actions/auth.ts` + the `(auth)` routes | P0 | 0.7, 0.8 |
| 0.10 | `(main)` layout, `TopBar`, `Sidebar`, `MobileNav` | P0 | 0.3 |

**Exit criteria:** a user can register, log in, log out, and the app shows the
signed-in shell. `npm run build` and `npm run lint` pass.

### M1 — Read paths (feed, profile)

**Goal:** the app shows real data.

| # | Task | P | Depends on |
|---|---|---|---|
| 1.1 | `dal/posts.ts`, `dal/profiles.ts`, `dal/users.ts` | P0 | M0 |
| 1.2 | `/explore` with `"use cache"` + `cacheTag("posts")` | P0 | 1.1 |
| 1.3 | `/profile/[userName]` — resolve the user, then the profile and the grid | P0 | 1.1 |
| 1.4 | `PostCard`, `PostMedia`, `PostHeader`, `PostCaption` | P0 | M0 |
| 1.5 | `/feed` with a skeleton and a "load more" action | P0 | 1.1 |
| 1.6 | `/post/[id]` with `generateMetadata` | P0 | 1.4 |

**Exit criteria:** the feed, the explore grid and a profile render real posts
from the backend, with skeletons and empty states.

### M2 — Write paths (post, like, comment, follow)

**Goal:** the user can publish and interact.

| # | Task | P | Depends on |
|---|---|---|---|
| 2.1 | The upload Route Handlers (`/api/upload/*`) | P0 | M0 |
| 2.2 | `ImageUploader` with the client-side validation | P0 | 2.1 |
| 2.3 | `/post/new` + `createPostAction` | P0 | 2.1 |
| 2.4 | `likePostAction` + the optimistic `LikeButton` | P0 | M1 |
| 2.5 | `favoriteAction` + `/saved` | P0 | M1 |
| 2.6 | `createCommentAction` + the comment panel | P0 | M1 |
| 2.7 | `followAction` + `FollowButton` + the follower dialogs | P0 | M1 |
| 2.8 | `deletePostAction` with a confirmation dialog | P1 | 2.3 |

**Exit criteria:** the journey register → publish → like → comment → follow
works end to end.

### M3 — Stories

| # | Task | P | Depends on |
|---|---|---|---|
| 3.1 | `dal/stories.ts` | P0 | M1 |
| 3.2 | `StoriesTray` + `StoryBubble` on the feed | P0 | 3.1 |
| 3.3 | `StoryViewer` with the progress bar and auto-advance | P0 | 3.2 |
| 3.4 | `createStoryAction` + `StoryComposer` | P0 | 2.1 |
| 3.5 | The viewers list | P1 | 3.3 |

**Exit criteria:** a story is uploaded, viewed, liked, and disappears after
24 hours.

### M4 — Chat

| # | Task | P | Depends on |
|---|---|---|---|
| 4.1 | `dal/chats.ts` | P0 | M1 |
| 4.2 | `/messages` — the chat list | P0 | 4.1 |
| 4.3 | `/messages/[chatId]` — the thread | P0 | 4.1 |
| 4.4 | `sendMessageAction` with an optional file | P0 | 2.1 |
| 4.5 | Delete a message / a conversation | P1 | 4.3 |

**Exit criteria:** two browsers can exchange messages.

### M5 — Profile editing and search

| # | Task | P | Depends on |
|---|---|---|---|
| 5.1 | `/profile/me/edit` + `updateProfileAction` | P1 | M1 |
| 5.2 | Avatar upload and removal | P1 | 2.1 |
| 5.3 | `/search` — user search + the search history | P1 | M1 |

### M6 — Polish and quality

| # | Task | P | Depends on |
|---|---|---|---|
| 6.1 | Dark mode without a flash | P1 | M0 |
| 6.2 | The 404 page, the error boundary, the empty states | P0 | M1 |
| 6.3 | Metadata, `robots.ts`, `sitemap.ts`, the OG image | P1 | M1 |
| 6.4 | The accessibility audit (keyboard, screen reader, axe) | P0 | all |
| 6.5 | The performance budget and a Lighthouse run | P0 | all |
| 6.6 | The Vitest suite (the client, the schemas, the helpers) | P0 | M0 |
| 6.7 | The Playwright suite (the journeys from `TESTING.md` §3) | P0 | M2 |
| 6.8 | `docs/BACKEND_READINESS.md` closed | P0 | backend |

## 2. Order and dependencies

```
M0 ──► M1 ──► M2 ──► M3
            │       └► M4
            └──────────► M5
                        │
M6 (needs every UI milestone)
```

## 3. Out of scope for this release

| Feature | Why |
|---|---|
| Real-time chat (WebSocket) | The backend has no socket layer |
| Hashtags and mentions | No backend support |
| Push notifications | No backend support |
| Locations picker | No locations API — only a `locationId` field |
| Admin / moderation UI | No admin role in the backend |
| Story highlights | Not in the API |
| Offline support (a service worker) | Deferred to a later release |
| Multiple images per message | The backend allows one file per message |
| Password change UI | The endpoint exists (`PUT /account/change-password`) but is not in the MVP — see M5 |

## 4. Risks per milestone

| Milestone | Risk | Mitigation |
|---|---|---|
| M0 | The backend's `/account/login` returns an unwrapped payload | The client accepts both shapes |
| M1 | The posts/profiles modules are not mounted | The UI shows a "backend unavailable" state; `BACKEND_READINESS.md` tracks it |
| M2 | The upload endpoint returns the raw entity, not a `PostDto` | Normalise in the DAL and log the shape once it is confirmed |
| M3 | The story expiry is server-side only | The UI also checks `expiresAt` |
| M4 | The chats module is not mounted either | Same as M1 |
| M6 | Cache Components makes the app dynamic by accident | The `<Suspense>` rule and the `npm run build` gate |
