# BACKEND READINESS — what the backend still owes the frontend

> **STATUS NOTE (2026-10-23):** **all items are resolved** — every module is registered in `AppModule`, the interceptor/filter/guard are global, the database is connected. See `../../backend/API_CONTRACT.md`.


| Field | Value |
|---|---|
| Backend | `backend/` (NestJS 12, TypeORM 1.x, SQLite) |
| Date | 2026-10-21 |
| Owner | backend team |
| Blocks | M1 and later milestones of the frontend (`ROADMAP.md`) |

## 1. The current state, in one paragraph

`backend/src/app.module.ts` imports **only** `AccountModule` (plus the
telemetry module). The controllers for posts, profiles, follows, comments,
favorites, stories, users, search-history and chats are written and typed,
but their modules are **not registered**, so every one of those routes answers
`404`. The `ResponseInterceptor`, the `HttpExceptionFilter` and the
`JwtAuthGuard` exist but are **never registered**, so the live responses are
not wrapped in `{ statusCode, data, errors }` and **no route is protected**.
There is no `TypeOrmModule.forRoot(...)` either, so the app does not
connect to the database.

The frontend is therefore written against the **documented contract**
(`API_CONTRACT.md`), and every call site must tolerate the difference
between the contract and the current runtime.

## 2. Blocking items

| ID | Item | Impact on the frontend | Status |
|---|---|---|---|
| BR-01 | Register the feature modules in `AppModule` (`PostsModule`, `ProfilesModule`, `FollowsModule`, `CommentsModule`, `FavoritesModule`, `StoriesModule`, `UsersModule`, `SearchHistoryModule`, `ChatsModule`) | Every page except the auth screens is empty | TODO |
| BR-02 | Connect the database (`TypeOrmModule.forRoot(databaseConfig)`) | No data at all | TODO |
| BR-03 | Register the `ResponseInterceptor` (`APP_INTERCEPTOR`) | Responses are not enveloped; the client copes, but the contract is unclear | TODO |
| BR-04 | Register the `HttpExceptionFilter` (`APP_FILTER`) | Errors are raw Nest errors; the client maps them by status | TODO |
| BR-05 | Register the `JwtAuthGuard` (`APP_GUARD`) | Nothing is protected — **the frontend must never rely on this** | TODO |
| BR-06 | Fix the `database.config.ts` driver (`type: 'sqlite'` → `better-sqlite3`) | The build is red | TODO |
| BR-07 | Hash the passwords with bcrypt (10+ rounds) | A security requirement on both sides | TODO |
| BR-08 | Serve `/uploads` statically and keep the relative URL | The images 404 | TODO |
| BR-09 | Return `PostDto` from `GET /profiles/me/favorites` | The saved page receives raw entities with a different shape | TODO |
| BR-10 | Resolve the route conflict between `UsersController` (`GET /users/:id`) and `FollowsController` (`GET /users/:userId/followers`, `DELETE /users/me`) | Ambiguous routing | TODO |

## 3. Non-blocking improvements

| ID | Item | Note |
|---|---|---|
| BR-11 | A real refresh-token flow (issue a JWT from `POST /account/refresh-token`) | The current `refreshToken` is the string `ref-<id>-<ts>` |
| BR-12 | Send the password-reset email instead of returning the token | `forgot-password` returns the token in the response body |
| BR-13 | Add the `Locations` module (`GET /locations`, CRUD) | `Post.locationId` exists but there is no locations API |
| BR-14 | Enforce `isPrivate` on the feed and the profile | The `isPrivate` flag is stored but never checked |
| BR-15 | Return `UserDetailDto` with a consistent avatar | `UserDetailDto.gender` is a number (`0`/`1`) |
| BR-16 | Add `@Type(() => Number)` to `CreateSearchHistoryDto.searchedUserId` | A string is rejected today |
| BR-17 | Rate-limit the auth routes | The frontend can only mitigate double submits |
| BR-18 | Add pagination to the search-history list | The list is capped at 50 items |
| BR-19 | Serve a generated OpenAPI document instead of the static legacy file | The Swagger UI is rebuilt from the decorators at boot |

## 4. The frontend's mitigation, per item

| Item | Mitigation in the frontend |
|---|---|
| BR-01 / BR-02 | The DAL returns a typed "backend unavailable" error; the UI shows an empty state with a retry, not a stack trace |
| BR-03 | `apiFetch` accepts the envelope **or** a bare payload (`ARCHITECTURE.md` §6) |
| BR-04 | Errors are mapped by HTTP status, not by the body (`API_CONTRACT.md` §7) |
| BR-05 | Every DAL function that needs a token calls `requireSession()` itself |
| BR-08 | `mediaUrl()` builds the absolute URL; `next/image` is configured with `remotePatterns` |
| BR-09 | The saved page normalises the raw entity to `PostDto` in the view layer |
| BR-11 | No silent refresh: the session ends when the cookie expires and the user signs in again |

## 5. How to verify the backend is ready

```bash
cd ../backend
npm run build          # must be green
npm run dev            # http://localhost:3000
```

Then, from the browser or with `curl`:

| Check | Expected |
|---|---|
| `GET /` | `200` — `"Hello World!"` |
| `POST /account/register` | `201` — the enveloped success shape |
| `POST /account/login` | `200` — `data.accessToken` present |
| `GET /posts` | `200` — `data.items` is an array (not a 404) |
| `GET /profiles/1` | `200` — `data.userName` present |
| `GET /users?search=a` | `200` — `data.items` is an array |
| `GET /posts/feed` **without** a token | `401` — the guard is active |
| `GET /posts/feed` **with** a token | `200` — `data.items` is an array |
| `GET /chats` with a token | `200` — an array |
| `GET /posts/1/comments` | `200` — `data.items` is an array |
| `GET /stories` with a token | `200` — an array of groups |
| `GET /profiles/me/favorites` with a token | `200` — `data.items[].images` is an array of strings |
| `GET /uploads/<file>` | `200` — the image bytes |
| `POST /posts` with 2 images | `201` — `data.images` is an array of 2 URLs |

When all of these pass, close BR-01 … BR-10 and update the status column in
`tz.md` §8 (the frontend requirements that were blocked).

## 6. Definition of done for the backend

- [ ] `npm run build` → 0 errors
- [ ] `npm test` and `npm run test:e2e` pass
- [ ] Every route in `API_CONTRACT.md` answers as documented
- [ ] The envelope is applied to **every** response
- [ ] The guard protects every route that is not `@Public()`
- [ ] The passwords are bcrypt hashes in the database
- [ ] The uploads are served at `/uploads`
- [ ] The Swagger UI at `/swagger` shows the live routes
- [ ] The check list in §5 is fully green
