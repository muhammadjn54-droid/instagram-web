# PRD — Instagram-like Web Client

| Field | Value |
|---|---|
| Product | Instagram-like Social Network — Web Frontend |
| Version | v0.1 |
| Date | 2026-10-21 |
| Owner | frontend team |
| Status | Draft, aligned with `tz.md` |
| Backend | `backend/` (NestJS 12) |

## 1. Vision

A web client that feels like Instagram: open the app and the feed of the
accounts you follow is already there, one tap to like, one tap to comment,
one tap to publish a photo, and your story disappears a day later. It must feel
instant on a phone, work on a slow connection, and never ask the user to sign
in twice.

## 2. Problem

| # | Problem | Evidence |
|---|---|---|
| P1 | There is no frontend at all | `frontend/src/app/` contains only the `create-next-app` starter (`layout.tsx`, `page.tsx`, `globals.css`) |
| P2 | The backend contract is not written down for the client | Routes are spread across 10 controllers; two of them (`UsersController`, `FollowsController`) share the `users` prefix |
| P3 | The backend is not ready to be consumed | `backend/src/app.module.ts` imports only `AccountModule`; the interceptor, the guard and the filter are never registered |
| P4 | No session strategy | The backend returns a JWT with no cookie, no refresh flow, no logout endpoint that invalidates anything |
| P5 | No design language | No tokens, no component inventory, no responsive rules |
| P6 | No quality gates | No tests, no lint baseline, no performance budget |

## 3. Personas and journeys

### P-A Visitor

Landing page → understand the product → register → land on an empty feed with
a "find people to follow" CTA.

**Journey J1 (register)**

1. Open `/`.
2. Click "Create account" → `/register`.
3. Fill userName, fullName, email, password, confirmPassword.
4. Submit → the backend creates the user, the frontend signs in automatically.
5. Land on `/feed`, which is empty and explains what to do next.

### P-B Returning user

Open `/` → redirected to `/feed` → scroll → like → open a chat → publish a
story → close the tab.

**Journey J2 (daily loop)**

1. `/feed` renders the newest posts of followed accounts.
2. Tap the heart → the count increments immediately, the request runs in the
   background.
3. Tap the speech bubble → a comment panel opens under the post.
4. `/messages` → open a chat → send a text and a photo.
5. Tap the avatar → `/stories` → publish a photo that expires in 24 h.

### P-C Creator

Publish a reel, check who watched the story, grow the follower count.

**Journey J3 (publish)**

1. `/post/new` → pick 3 photos from the phone → reorder → write a caption →
   share.
2. The post appears at the top of `/feed` and `/explore`.
3. `/profile/me` shows the new post as the first grid cell.

## 4. Key business rules (frontend-observable)

1. A story lives 24 hours and then disappears from every list.
2. A user cannot follow themselves.
3. Only the owner can delete a post, story, comment, chat or message.
4. `password` must equal `confirmPassword` on register.
5. `userName` and `email` are unique → a conflict is a field-level error.
6. A post can be liked, viewed and favourited only once per user.
7. A post needs between 1 and 10 images.
8. A comment is between 1 and 500 characters.
9. Uploads are limited to 5 MB per file and to `jpg`, `jpeg`, `png`, `webp`.
10. The signed-in user id always comes from the session, never from the input.

Full list with numbers: `tz.md` §12.

## 5. Features (MoSCoW)

Legend: **M** must · **S** should · **C** could · **W** won't (this release).

| ID | Feature | M/S/C/W | Area | Status |
|---|---|---|---|---|
| F-01 | Register with userName, fullName, email, password, confirmPassword | M | Auth | TODO |
| F-02 | Log in and get a persistent session | M | Auth | TODO |
| F-03 | Log out and clear the session | M | Auth | TODO |
| F-04 | Forgot / reset password | S | Auth | TODO |
| F-05 | Protected-route redirect with a `next` return path | M | Auth | TODO |
| F-06 | Feed of followed accounts | M | Feed | TODO |
| F-07 | Explore feed of all public posts | M | Feed | TODO |
| F-08 | Reels feed | M | Feed | TODO |
| F-09 | Post detail page with comments | M | Feed | TODO |
| F-10 | Create a post with 1–10 images and a caption | M | Post | TODO |
| F-11 | Like / unlike a post | M | Post | TODO |
| F-12 | Favourite / unfavourite a post | M | Post | TODO |
| F-13 | Comment on a post | M | Post | TODO |
| F-14 | Delete own post | S | Post | TODO |
| F-15 | Stories tray, viewer, like, viewers list | M | Story | TODO |
| F-16 | Publish a story (one image, 24 h) | M | Story | TODO |
| F-17 | Public profile page with the post grid | M | Profile | TODO |
| F-18 | Own profile: edit bio, website, gender, private flag | S | Profile | TODO |
| F-19 | Avatar upload and removal | S | Profile | TODO |
| F-20 | Follow / unfollow, follower and following lists | M | Profile | TODO |
| F-21 | Saved posts (favourites) page | S | Profile | TODO |
| F-22 | Chat list and conversation view | M | Chat | TODO |
| F-23 | Send a text message and one optional file | M | Chat | TODO |
| F-24 | Delete a message / a conversation | S | Chat | TODO |
| F-25 | User search with persisted search history | S | Search | TODO |
| F-26 | Dark mode | S | UI | TODO |
| F-27 | Loading skeletons, empty states, error states | M | UI | TODO |
| F-28 | Keyboard navigation and screen-reader labels | M | A11y | TODO |
| F-29 | Metadata, Open Graph images, sitemap, robots | S | SEO | TODO |
| F-30 | Unit + E2E tests, lint and build gates | M | Quality | TODO |
| F-31 | Real-time chat over WebSocket | W | Chat | TODO (out of MVP) |
| F-32 | Hashtags and @mentions | W | Post | TODO (out of MVP) |
| F-33 | Push notifications | W | Platform | TODO (out of MVP) |
| F-34 | Location picker with search | W | Post | TODO (backend has no locations API) |
| F-35 | Admin / moderation UI | W | Platform | TODO (out of MVP) |
| F-36 | Stories highlights | W | Story | TODO (out of MVP) |

## 6. Success metrics

| Metric | Target | How to measure |
|---|---|---|
| M1 | `npm run build` passes with 0 errors | build log |
| M2 | `npm run lint` reports 0 problems | lint output |
| M3 | Register → post → like → comment completes without a console error | manual checklist, `docs/TESTING.md` §3 |
| M4 | Feed LCP ≤ 2.5 s on a mid-range Android over 4G | Lighthouse, CI |
| M5 | 100 % of interactive elements reachable by keyboard | `docs/ACCESSIBILITY.md` checklist |
| M6 | 0 tokens in `localStorage` / `sessionStorage` / the JS bundle | `docs/SECURITY.md` checklist |
| M7 | Every route has `loading` + `error` handling | file-system check |
| M8 | Public pages render without JavaScript | JS-disabled check |

## 7. MVP definition

The MVP is complete when:

1. `npm run build` and `npm run lint` both pass with zero problems.
2. Journeys J1, J2 and J3 pass end to end against a working backend.
3. Every **M** feature in §5 is implemented.
4. Every route in `tz.md` §13 exists with `loading` and `error` handling.
5. The security checklist in `docs/SECURITY.md` is fully green.
6. The accessibility checklist in `docs/ACCESSIBILITY.md` is fully green.
7. `docs/DEFINITION_OF_DONE.md` is satisfied for every merged task.
