# PRD — Instagram-like Social Network API

| Field | Value |
|---|---|
| Product | Instagram-like Social Network API |
| Version | v0.1 |
| Date | 2026-10-21 |
| Owner | backend team |
| Status | Draft, aligned with `src/` code |

## 1. Vision

A backend that lets people register, share photos and short videos (reels),
publish 24-hour stories, follow each other, talk in direct messages, and save
the content they like. The API must be easy to integrate with a mobile or web
client, and every endpoint must be documented and testable from Swagger UI.

## 2. Problem

| # | Problem | Evidence |
|---|---|---|
| P1 | No working auth | `account.service.ts` keeps users in an array, returns `mock-jwt-token-for-*` |
| P2 | No database connection | `database.config.ts` exists but `app.module.ts` never imports `TypeOrmModule.forRoot` |
| P3 | 52 of 57 planned endpoints do not exist | `src/modules/` has folders but no controllers except `account` |
| P4 | No validation of input | `RegisterDto` / `LoginDto` have no class-validator decorators |
| P5 | Swagger shows endpoints that return nothing useful | served document is the legacy .NET spec, static file |
| P6 | Passwords would be stored in plain text | `account.service.ts` assigns `dto.password` directly |

## 3. Personas

### P-A Guest (not signed in)
Wants to look around before creating an account.

| Can | Cannot |
|---|---|
| Register, log in, request a password reset | Read any feed, post, story, chat or profile |

### P-B User (signed in, normal account)
The main customer. Posts, follows, comments, chats.

| Can | Cannot |
|---|---|
| Edit own profile and posts, follow/unfollow, like, comment, favorite, upload stories, chat, search | Edit or delete other users' content, read private accounts they do not follow (rule in §4) |

### P-C Admin (moderator)
Keeps the platform clean.

| Can | Cannot |
|---|---|
| Delete any post, story, comment or user account; block abusive users | Change business rules, edit other people's profiles as if they were the owner |

> Admin role is **planned**. There is no `role` column in `src/entities/user.entity.ts`
> today — see `docs/OPEN_QUESTIONS.md` Q-01.

## 4. Key business rules (summary, full list in `docs/TZ.md` §10)

1. A story lives 24 hours and then disappears from all listings.
2. A user cannot follow themselves.
3. Only the owner can delete a post, story, comment, chat or message.
4. `password` and `confirmPassword` must be equal on register.
5. `userName` and `email` are unique.
6. A user cannot like, view or favorite the same post twice.
7. Passwords are stored only as a bcrypt hash (min 10 rounds).
8. The current user id comes from the JWT only, never from the request body.

## 5. Features (MoSCoW)

Legend: **M** = Must (MVP), **S** = Should, **C** = Could, **W** = Won't (this release).

| ID | Feature | M/S/C/W | Module | Status |
|---|---|---|---|---|
| F-01 | Register with userName, fullName, email, password | M | Account | PARTIAL |
| F-02 | Log in and receive a JWT | M | Account | PARTIAL (mock token) |
| F-03 | Forgot / reset / change password | M | Account | PARTIAL (stubs) |
| F-04 | Own profile: bio, avatar, website, gender, private flag | M | Profiles | TODO |
| F-05 | Public profile of another user | M | Profiles | TODO |
| F-06 | Follow / unfollow, followers list, following list | M | Follows | TODO |
| F-07 | Create a post with 1–10 images | M | Posts | TODO |
| F-08 | Feed of posts from followed users | M | Posts | TODO |
| F-09 | Reels feed (`isReel = true`) | M | Posts | TODO |
| F-10 | Like and unlike a post | M | Posts | TODO |
| F-11 | Register a post view | S | Posts | TODO |
| F-12 | Add / list / delete comments | M | Comments | TODO |
| F-13 | Add / remove / list favorites (saved posts) | M | Favorites | TODO |
| F-14 | Upload a story (image), 24 h life | M | Stories | TODO |
| F-15 | View stories, like a story, register a story view | M | Stories | TODO |
| F-16 | Chats: list, create, send message, delete message/chat | M | Chats | TODO |
| F-17 | Locations: list, read, add, update, delete | S | Locations | TODO |
| F-18 | Search users, remember search history | M | Users | TODO |
| F-19 | Admin moderation endpoints | W | — | TODO (out of MVP) |
| F-20 | Real-time chat over WebSocket | W | Chats | TODO (out of MVP) |
| F-21 | Hashtags and mentions | W | Posts | TODO (out of MVP) |
| F-22 | Push notifications | W | — | TODO (out of MVP) |

## 6. Success metrics

| Metric | Target | How to measure |
|---|---|---|
| M1 | 100% of endpoints in `API_CONTRACT.md` marked DONE exist in `src/` | grep controller routes vs contract table |
| M2 | 0 TypeScript errors on `npm run build` | build log |
| M3 | 100% of endpoints have Swagger success + 5 error responses | Swagger UI check, `SWAGGER_RULES.md` checklist |
| M4 | 100% of DTO fields have a validator | code review, `CODING_RULES.md` §3 |
| M-05 | Passwords are bcrypt hashes in DB, never plain text | DB row check |
| M6 | Every module has unit tests, every critical flow has an e2e test | `npm test`, `npm run test:e2e` |
| M7 | List endpoints return ≤ 100 ms at 10 000 rows (SQLite) | timer in `TESTING.md` |
| M8 | Swagger UI loads in ≤ 3 s on localhost | manual stopwatch |

## 7. MVP definition

The MVP is complete when:

1. `npm run build` passes with 0 errors.
2. Auth works against the real database with a real JWT (F-01…F-03 DONE).
3. A signed-in user can complete the full manual flow in `TESTING.md` §3:
   register → login → create post → like → comment → follow → story → chat.
4. Every endpoint of that flow is in `API_CONTRACT.md` marked DONE.
5. All Must features in §5 are DONE.
6. `docs/TRACEABILITY.md` has no row with status `TODO` for a Must feature.
