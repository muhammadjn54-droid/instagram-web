# TZ — Technical Specification / SRS

## 1. Document control

| Field | Value |
|---|---|
| System | Instagram-like Social Network API |
| Version | v0.1 |
| Date | 2026-10-21 |
| Baseline | `backend/src` at commit-less working tree, snapshot 2026-10-21 18:17 |

Status legend: **DONE** = implemented in `src/`; **PARTIAL** = endpoint exists but is a stub/mock;
**TODO** = not in `src/` yet. Priority: **P0** Must, **P1** Should, **P2** Could.

## 2. Goal

Deliver a REST API for an Instagram-like app where a user can register, publish
posts, reels and 24-hour stories, follow other users, like, comment, favorite,
chat, and search — with every endpoint documented in Swagger and testable.

## 3. Scope

| In scope | Out of scope (this release) |
|---|---|
| JWT auth (register, login, reset password) | OAuth / social login |
| Users, profiles, follows | Admin role and moderation tools |
| Posts, reels, likes, views, comments, favorites | Hashtags, mentions, recommendations |
| 24-hour stories | Live video stories, story highlights |
| Direct chats with text and one file | WebSocket / push real-time chat |
| Locations | Geolocation search by radius |
| Search history | Elasticsearch full-text search |

## 4. Roles and permissions

| Capability | Guest | User | Admin |
|---|---|---|---|
| Register, log in, reset password | Yes | Yes | Yes |
| Read own profile, update profile, avatar | No | Yes | Yes |
| Read another user's profile | No | Yes | Yes |
| Create / delete own post, story | No | Yes | Yes |
| Like, view, comment, favorite | No | Yes | Yes |
| Follow / unfollow | No | Yes | Yes |
| Read / send chat messages | No | Yes | Yes |
| Delete anyone's post or account | No | No | Yes (planned) |

## 5. Functional requirements

| ID | Requirement | Module | P | Status |
|---|---|---|---|---|
| FR-001 | Register with userName, fullName, email, password, confirmPassword | Account | P0 | PARTIAL |
| FR-002 | Log in and receive a signed JWT access token | Account | P0 | PARTIAL |
| FR-003 | Request a password reset link for an email | Account | P0 | PARTIAL |
| FR-004 | Reset a password using a reset token | Account | P0 | PARTIAL |
| FR-005 | Change the password of the signed-in user | Account | P0 | PARTIAL |
| FR-006 | Reject a duplicate userName or email (409) | Account | P0 | DONE |
| FR-007 | Store the password only as a bcrypt hash (10 rounds) | Account | P0 | TODO |
| FR-010 | Search users by userName / email with pagination | Users | P0 | TODO |
| FR-011 | Read one user by id | Users | P1 | TODO |
| FR-012 | Delete the signed-in user's account | Users | P1 | TODO |
| FR-013 | Save a text search into the user's search history | Users | P0 | TODO |
| FR-014 | Save a user-targeted search into the search history | Users | P1 | TODO |
| FR-015 | Read and clear the user's own search history | Users | P0 | TODO |
| FR-020 | Read the signed-in user's own profile | Profiles | P0 | TODO |
| FR-021 | Read another user's profile by userId | Profiles | P0 | TODO |
| FR-022 | Update bio, avatar url, website, gender, isPrivate | Profiles | P0 | TODO |
| FR-023 | Upload and delete the profile avatar image | Profiles | P0 | TODO |
| FR-024 | Report whether the signed-in user follows a given user | Profiles | P1 | TODO |
| FR-030 | Follow another user (one row per pair) | Follows | P0 | TODO |
| FR-031 | Unfollow a user | Follows | P0 | TODO |
| FR-032 | List the followers (subscribers) of a user | Follows | P0 | TODO |
| FR-033 | List the accounts a user follows (subscriptions) | Follows | P0 | TODO |
| FR-040 | Create a post with 1–10 images and optional location | Posts | P0 | TODO |
| FR-041 | Read one post by id | Posts | P0 | TODO |
| FR-042 | List posts of a user with filters and pagination | Posts | P0 | TODO |
| FR-043 | List the signed-in user's own posts | Posts | P0 | TODO |
| FR-044 | Delete the signed-in user's own post | Posts | P0 | TODO |
| FR-045 | Like and unlike a post | Posts | P0 | TODO |
| FR-046 | Register a post view (one per user per post) | Posts | P1 | TODO |
| FR-047 | List reels (`isReel = true`) with pagination | Posts | P0 | TODO |
| FR-048 | Build the feed from the accounts the user follows | Posts | P0 | TODO |
| FR-050 | Add a comment to a post | Comments | P0 | TODO |
| FR-051 | List the comments of a post | Comments | P0 | TODO |
| FR-052 | Delete the signed-in user's own comment | Comments | P0 | TODO |
| FR-060 | Save a post into favorites (one row per pair) | Favorites | P0 | TODO |
| FR-061 | Remove a post from favorites | Favorites | P0 | TODO |
| FR-062 | List the signed-in user's favorites | Favorites | P0 | TODO |
| FR-070 | Upload a story image (max 1 file per story) | Stories | P0 | TODO |
| FR-071 | Expire a story 24 h after creation | Stories | P0 | TODO |
| FR-072 | List active stories of followed users | Stories | P0 | TODO |
| FR-073 | List the active stories of one user | Stories | P0 | TODO |
| FR-074 | List the signed-in user's own active stories | Stories | P0 | TODO |
| FR-075 | Read one story, like it, and register a story view | Stories | P0 | TODO |
| FR-076 | Delete the signed-in user's own story | Stories | P0 | TODO |
| FR-080 | List the signed-in user's chats | Chats | P0 | TODO |
| FR-081 | Read one chat with its messages | Chats | P0 | TODO |
| FR-082 | Create a chat with another user (no duplicates) | Chats | P0 | TODO |
| FR-083 | Send a text message into a chat | Chats | P0 | TODO |
| FR-084 | Send a message with one optional file | Chats | P1 | TODO |
| FR-085 | Delete an own message and delete an own chat | Chats | P0 | TODO |
| FR-090 | List locations with city / state / zip / country filters | Locations | P1 | TODO |
| FR-091 | Read one location by id | Locations | P1 | TODO |
| FR-092 | Create a location | Locations | P1 | TODO |
| FR-093 | Update a location | Locations | P1 | TODO |
| FR-094 | Delete a location (posts keep `locationId = NULL`) | Locations | P1 | TODO |
| FR-100 | `GET /` answers "Hello World!" (health check) | Platform | P1 | DONE |
| FR-101 | Every response uses `{statusCode, data, errors}` | Platform | P0 | PARTIAL |
| FR-102 | A global JWT guard protects every non-public route | Platform | P0 | PARTIAL |
| FR-103 | Public routes work without a token | Platform | P0 | PARTIAL |
| FR-104 | Swagger UI at `/swagger` and `/api` | Platform | P0 | DONE |
| FR-105 | A global filter converts exceptions to the wrapper shape | Platform | P0 | PARTIAL |
| FR-106 | List endpoints paginate with `pageNumber` / `pageSize` | Platform | P0 | TODO |

## 6. Non-functional requirements

Full list with numbers: `docs/NFR.md`. Headlines: JWT + bcrypt (≥10 rounds),
input validation on 100% of DTO fields, ≤ 100 ms p95 for list endpoints,
≤ 10 MB per uploaded file, 1 request/second per IP on auth routes, 0 secrets in
the repository.

## 7. Tech stack

See `about.md` §2 for the real package list and versions. Summary: NestJS 12 (ESM),
TypeORM 1.x on SQLite (`better-sqlite3`), JWT via passport-jwt, class-validator,
`@nestjs/swagger`, Vitest.

## 8. Data requirements

16 TypeORM entities already exist in `src/entities/` (users, profiles, follows,
locations, posts, post_images, post_likes, post_views, comments, favorites,
stories, story_likes, story_views, chats, messages, search_history).
Field-level spec and ER diagram: `DATABASE.md`.

## 9. API requirements

* One JSON wrapper: `{ statusCode, data, errors }` (`src/common/responses/api-response.ts`).
* Pagination input `pageNumber` (≥1), `pageSize` (1–100); output `PagedResult<T>`.
* Bearer JWT in the `Authorization` header for every non-public route.
* Current user id only from `@CurrentUser()`.
* No password or token in a query string.
* ISO 8601 dates, field names `createdAt` / `updatedAt`.
* Full endpoint table: `API_CONTRACT.md`.

## 10. Business rules

1. A story is visible for exactly 24 h from `createdAt`; after that it disappears from listings.
2. A user cannot follow themselves → 400.
3. Only the owner may delete a post, story, comment, message, or chat → 403 otherwise.
4. `password` must equal `confirmPassword` on register → 400.
5. `userName` and `email` are unique → 409.
6. A user may like / view / favorite a given post only once → unique (postId, userId).
7. A user may follow a given account only once → unique (followerId, followingId).
8. One chat per pair of users; `user1Id` is always the smaller id.
9. Passwords are never stored or logged in plain text.
10. The signed-in user id is never taken from query or body.
11. Deleting a user cascades to their posts, stories, comments, likes, views, favorites, follows, chats.
12. Deleting a location sets `posts.locationId` to NULL (post stays).
13. Deleted stories are removed physically (no soft delete in the current schema).
14. Pagination default `pageNumber=1`, `pageSize=10`, max `pageSize=100`.
15. A comment is 1–500 characters; a story caption is 0–500 characters.

## 11. Acceptance criteria

| ID | Criterion |
|---|---|
| AC-01 | `POST /Account/register` with equal passwords → 200 `{data:"User registered successfully"}` |
| AC-02 | Register with a duplicate email → 400 `User already exists` |
| AC-03 | Register with different passwords → 400 `Passwords do not match` |
| AC-04 | `POST /Account/login` with correct password → 200 and a token in `data` |
| AC-05 | `GET /` → 200 `Hello World!` |
| AC-06 | Any route without a token → 401 with `errors` array (once FR-102 is DONE) |
| AC-07 | `DELETE /posts/{id}` by a non-owner → 403 `Forbidden` |
| AC-08 | `GET /posts` returns `data.items` + `data.totalCount` + `data.totalPages` |
| AC-09 | A story older than 24 h is absent from `GET /stories` |
| AC-10 | A file larger than 10 MB → 400 `File too large` |
| AC-11 | `npm run build` finishes with 0 TypeScript errors |
| AC-12 | Every endpoint in `API_CONTRACT.md` marked DONE has a Swagger success + 5 error responses |

## 12. Risks, assumptions, constraints

Top risks are in `docs/RISKS.md` (12 items). The three that affect this spec:

* RISK-001 — build is red (`database.config.ts` uses `type: 'sqlite'`, TypeORM 1.x wants `better-sqlite3`).
* RISK-004 — passwords are plain text in `account.service.ts` (FR-007).
* RISK-009 — served Swagger is a static legacy file, so decorator work is invisible to clients.

Assumptions: SQLite is enough for the demo; the frontend is Next.js in `frontend/`;
the legacy .NET spec in `src/swagger.old.json` defines the feature set only.
Constraints: no microservices, no `any`, one folder per module, docs-only tasks
must not change business logic.

## 13. Open questions

See `docs/OPEN_QUESTIONS.md` (Q-01 … Q-12). The blocking ones for the build phase:
Q-02 (JWT lifetime), Q-03 (register/login path names), Q-04 (admin role), Q-05 (file storage).
