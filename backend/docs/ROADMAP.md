# ROADMAP — Instagram-like Social Network API

| Field | Value |
|---|---|
| Version | v0.1 |
| Date | 2026-10-21 |
| Legend | `[x]` delivered · `[~]` in progress · `[ ]` not started |

## v0.1 — Foundation (current)

Goal: a project that builds, connects to the database and protects its routes.

| # | Item | Status |
|---|---|---|
| 1 | NestJS 12 project, ESM, TypeORM, SQLite | [x] |
| 2 | 16 entities with relations, constraints and a barrel file | [x] |
| 3 | Response wrapper `ApiResponse` / `PagedResult` / `ErrorResponseDto` | [x] |
| 4 | Swagger helpers `ApiOkWrapped` / `ApiCreatedWrapped` / `ApiPagedWrapped` / `ApiErrorResponses` | [x] |
| 5 | Decorators `@CurrentUser()`, `@Public()` | [x] |
| 6 | `JwtAuthGuard`, `HttpExceptionFilter`, `ResponseInterceptor` written | [x] |
| 7 | 5 legacy Account routes + a mock service | [x] |
| 8 | Complete documentation set (this pass) | [x] |
| 9 | Fix the DB config and connect TypeORM | [ ] |
| 10 | Register the guard, pipe, filter, interceptor, PassportModule, JwtStrategy | [ ] |
| 11 | bcrypt password hashing + a real signed JWT | [ ] |
| 12 | Swagger generated from the decorators | [ ] |
| 13 | `npm run seed` and the daily backup script | [ ] |
| 14 | Fix the broken native bindings (lint and tests) | [ ] |

## v1.0 — MVP

Goal: the full manual flow of `TESTING.md` §3 works with a real database.

| # | Item | Depends on | Status |
|---|---|---|---|
| 1 | Users module: search, read, delete the account | v0.1 #9, #10 | [ ] |
| 2 | Profiles module: read, update, avatar upload | v1.0 #1 | [ ] |
| 3 | Follows module: follow, unfollow, followers, following | v1.0 #1 | [ ] |
| 4 | Posts module: create, read, list, my posts, delete | v1.0 #1 | [ ] |
| 5 | Likes and views on a post | v1.0 #4 | [ ] |
| 6 | Comments module: add, list, delete | v1.0 #4 | [ ] |
| 7 | Favorites module: add, remove, list | v1.0 #4 | [ ] |
| 8 | Stories module: upload, 24 h expiry, list, view, like, delete | v1.0 #3 | [ ] |
| 9 | Chats module: create, list, send a message, delete | v1.0 #1 | [ ] |
| 10 | Search history module | v1.0 #1 | [ ] |
| 11 | Locations module | v0.1 #9 | [ ] |
| 12 | Feed of the followed accounts | v1.0 #3, #4 | [ ] |
| 13 | Rate limiting on the auth routes | v0.1 #10 | [ ] |
| 14 | E2E tests for the 10 flows of `docs/USE_CASES.md` | v1.0 #1…#12 | [ ] |

**Exit criteria of v1.0**: every P0 feature of `docs/PRD.md` §5 is DONE, the
flow of `TESTING.md` §3 answers the documented status codes, and no row of
`docs/TRACEABILITY.md` with a P0 requirement is still TODO.

## v1.5 — Usability

| # | Item | Depends on | Status |
|---|---|---|---|
| 1 | Reels: upload a video, list the reels, autoplay | v1.0 #4 | [ ] |
| 2 | Carousel of up to 10 images with the ordering | v1.0 #4 | [ ] |
| 3 | Refresh token flow and the logout endpoint | v0.1 #11 | [ ] |
| 4 | Private accounts: the request to follow, accept, reject | v1.0 #3 | [ ] |
| 5 | Direct chat: read receipts, delete a chat for everyone | v1.0 #9 | [ ] |
| 6 | Locations: search by radius, attach a location to a story | v1.0 #11 | [ ] |
| 7 | Notifications in the database (no push yet) | v1.0 #3, #5, #8 | [ ] |
| 8 | Search by hashtag and by location | v1.0 #12 | [ ] |
| 9 | Post and story editing | v1.0 #4, #8 | [ ] |
| 10 | Seed script with 20 demo users, posts, stories and chats | v0.1 #13 | [ ] |
| 11 | Postman collection exported from the OpenAPI document | v0.1 #12 | [ ] |

## v2.0 — Platform

| # | Item | Depends on | Status |
|---|---|---|---|
| 1 | Admin role and moderation endpoints | v1.5 #4 | [ ] |
| 2 | Real-time chat over WebSocket | v1.0 #9 | [ ] |
| 3 | Push notifications (FCM) | v1.5 #7 | [ ] |
| 4 | Report a post, a story or a user | v2.0 #1 | [ ] |
| 5 | Blocking a user | v1.5 #4 | [ ] |
| 6 | Replace SQLite by PostgreSQL with migrations | v1.0 | [ ] |
| 7 | Move the files to an object storage (S3) | v1.0 #4, #8 | [ ] |
| 8 | CI: build, lint, unit tests, e2e tests on every push | v0.1 #14 | [ ] |
| 9 | Structured logs with a correlation id | v1.5 #10 | [ ] |
| 10 | Rate limit and cache with Redis | v1.0 #13 | [ ] |

## Order of work — the shortest path to a demo

```text
v0.1 #9  DB config + TypeORM
   ↓
v0.1 #10 guard + pipe + filter + interceptor + JWT strategy
   ↓
v0.1 #11 bcrypt + real JWT
   ↓
v0.1 #12 Swagger from the decorators
   ↓
v1.0 #1  Users  →  #2 Profiles  →  #3 Follows
   ↓
v1.0 #4  Posts  →  #5 Likes  →  #6 Comments  →  #7 Favorites
   ↓
v1.0 #8  Stories           v1.0 #9 Chats           v1.0 #10 Search history
   ↓
v1.0 #12 Feed              v1.0 #11 Locations
   ↓
v1.0 #14 E2E tests of the 10 flows
```

This order is the same as the "Next 5 tasks" of `TASKS.md`.
