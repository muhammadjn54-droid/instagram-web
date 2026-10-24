# TASKS — work items of the Instagram-like API

> **STATUS NOTE (2026-10-23):** this checklist was written on 2026-10-21 **before** the modules were built and is historical. All 11 modules, the database, guards, validation, Swagger, uploads and the seed now exist and work — see `API_CONTRACT.md` (verified list of 64 endpoints) and the root `../tz.md`. The "Known bugs" table below is closed except: no admin check for locations, no rate limiting, hard-coded fallback `JWT_SECRET` (see `../specs/SECURITY.md` §4).


| Field | Value |
|---|---|
| Version | v0.1 |
| Date | 2026-10-21 |
| Built from | the real code in `src/` at 2026-10-21 18:17 |

Legend: `[x]` done in `src/` · `[ ]` todo. Status per module matches
`API_CONTRACT.md` and `docs/TZ.md`.

## Platform / infrastructure

- [x] `GET /` health check (`src/app.controller.ts`)
- [x] Swagger UI mounted at `/swagger` and `/api` (`src/main.ts`)
- [x] CORS enabled (`src/main.ts`)
- [x] Response wrapper classes `ApiResponse`, `PagedResult`, `ErrorResponseDto`
- [x] Swagger helpers `ApiOkWrapped`, `ApiCreatedWrapped`, `ApiPagedWrapped`, `ApiErrorResponses`
- [x] Decorators `@CurrentUser()`, `@Public()`
- [x] `JwtAuthGuard`, `HttpExceptionFilter`, `ResponseInterceptor` written
- [x] 16 TypeORM entities + `src/entities/index.ts` barrel
- [x] `src/config/database.config.ts` written
- [ ] Fix `database.config.ts`: `type: 'sqlite'` → `type: 'better-sqlite3'` (RISK-001)
- [ ] Connect the database: `TypeOrmModule.forRoot(databaseConfig)` in `app.module.ts`
- [ ] Register `APP_GUARD` (`JwtAuthGuard`), `APP_PIPE` (`ValidationPipe`), `APP_FILTER`, `APP_INTERCEPTOR`
- [ ] Register `PassportModule`, `JwtModule` and `JwtStrategy` inside `AccountModule`
- [ ] Mark the public routes with `@Public()`
- [ ] Replace the static Swagger document with `SwaggerModule.createDocument` (RISK-005)
- [ ] Serve `uploads/` as static files
- [ ] Add `@nestjs/throttler` with the limits of NFR-012…NFR-014
- [ ] Add `npm run seed` and `scripts/backup.sh`

## Account

- [x] `POST /Account/register` (mock service)
- [x] `POST /Account/login` (mock service)
- [x] `DELETE /Account/ForgotPassword` (stub)
- [x] `DELETE /Account/ResetPassword` (stub)
- [x] `PUT /Account/ChangePassword` (stub)
- [x] `RegisterDto`, `LoginDto`, `JwtStrategy`
- [ ] Hash the password with bcrypt, 10 rounds (FR-007, RISK-002)
- [ ] Sign a real JWT in `login`, return `{accessToken, refreshToken, expiresIn}`
- [ ] Store the users in the database instead of the array (FR-007)
- [ ] Add class-validator decorators to both DTOs
- [ ] Implement the real forgot / reset / change password flow (FR-003…FR-005)
- [ ] Move the password fields from the query string into the body
- [ ] Answer 409 (not 400) when the userName or email is taken
- [ ] Add the Swagger decorators to all 5 routes

## Users

- [ ] `GET /users` with `userName` / `email` filters and pagination
- [ ] `GET /users/me`
- [ ] `GET /users/{userId}`
- [ ] `DELETE /users/{userId}` with the owner/admin check

## Search history

- [ ] `POST /search-histories` (text search)
- [ ] `POST /search-histories/user-searches` (user search)
- [ ] `GET /search-histories` and `GET /search-histories/user-searches`
- [ ] `DELETE /search-histories/{id}` and `DELETE /search-histories/user-searches/{id}`
- [ ] `DELETE /search-histories` and `DELETE /search-histories/user-searches` (clear all)

## Profiles

- [ ] `GET /profiles/me`
- [ ] `GET /profiles/{userId}` with the private-account check
- [ ] `PUT /profiles/{userId}` (bio, website, gender, isPrivate)
- [ ] `GET /profiles/{userId}/follow-state`
- [ ] `PUT /profiles/{userId}/avatar` (multipart)
- [ ] `DELETE /profiles/{userId}/avatar`

## Follows

- [ ] `POST /follows` with the self-follow check
- [ ] `DELETE /follows/{followingUserId}`
- [ ] `GET /users/{userId}/followers` (subscribers)
- [ ] `GET /users/{userId}/following` (subscriptions)

## Posts

- [ ] `POST /posts` with 1–10 images and the optional location
- [ ] `GET /posts/{postId}`
- [ ] `GET /posts` with the filters and pagination
- [ ] `GET /users/me/posts`
- [ ] `GET /posts/feed` (posts of the followed accounts)
- [ ] `GET /reels`
- [ ] `DELETE /posts/{postId}` with the owner check
- [ ] `POST /posts/{postId}/likes` and `DELETE /posts/{postId}/likes`
- [ ] `POST /posts/{postId}/views`

## Comments

- [ ] `POST /posts/{postId}/comments` (1–500 chars)
- [ ] `GET /posts/{postId}/comments`
- [ ] `DELETE /comments/{commentId}` with the author check

## Favorites

- [ ] `POST /favorites` (unique pair)
- [ ] `DELETE /favorites/{postId}`
- [ ] `GET /users/me/favorites`

## Stories

- [ ] `POST /stories` with `expiresAt = createdAt + 24 h`
- [ ] `GET /stories` (followed accounts, not expired)
- [ ] `GET /users/{userId}/stories` and `GET /users/me/stories`
- [ ] `GET /stories/{storyId}`
- [ ] `POST /stories/{storyId}/likes`
- [ ] `POST /stories/{storyId}/views`
- [ ] `DELETE /stories/{storyId}` with the owner check

## Chats — the folder `src/modules/chats/` does not exist yet

- [ ] Create the folder, the module, the controller and the service
- [ ] `GET /chats`
- [ ] `GET /chats/{chatId}`
- [ ] `POST /chats` (one chat per pair, `user1Id` = smaller id)
- [ ] `POST /chats/{chatId}/messages` (text and file)
- [ ] `DELETE /chats/{chatId}/messages/{messageId}`
- [ ] `DELETE /chats/{chatId}`

## Locations — the folder `src/modules/locations/` does not exist yet

- [ ] Create the folder, the module, the controller and the service
- [ ] `GET /locations` with the city / state / zip / country filters
- [ ] `GET /locations/{locationId}`
- [ ] `POST /locations`
- [ ] `PUT /locations/{locationId}`
- [ ] `DELETE /locations/{locationId}`

## Tests

- [x] `src/app.controller.spec.ts` (root controller)
- [x] `test/app.e2e-spec.ts` (root e2e)
- [ ] Unit test for `AccountService`
- [ ] E2E test for the 10 flows of `docs/USE_CASES.md`
- [ ] Fix the broken native bindings so `npm test` and `npm run lint` run

## Documentation — done in this pass

- [x] `about.md`, `what.shuld.donotuse.md`
- [x] `docs/PRD.md`, `docs/TZ.md`, `docs/USER_STORIES.md`, `docs/USE_CASES.md`
- [x] `docs/NFR.md`, `docs/GLOSSARY.md`, `docs/RISKS.md`
- [x] `DATABASE.md`, `API_CONTRACT.md`, `ARCHITECTURE.md`
- [x] `CODING_RULES.md`, `SWAGGER_RULES.md`
- [x] `CLAUDE.md`, `TASKS.md`, `TESTING.md`, `PROMPTS.md`
- [x] `docs/DEFINITION_OF_DONE.md`, `docs/ROADMAP.md`, `docs/TRACEABILITY.md`
- [x] `CHANGELOG.md`, `docs/DECISIONS.md`, `docs/OPEN_QUESTIONS.md`

## Next 5 tasks

| # | Task | Why now | Done when |
|---|---|---|---|
| 1 | Fix `database.config.ts` and connect TypeORM in `app.module.ts` | RISK-001 + RISK-004: without it nothing can be stored | `npm run build` passes, `data/app.sqlite` appears, `User` rows can be inserted |
| 2 | Register the guard, pipe, filter, interceptor, `PassportModule`, `JwtStrategy` and `@Public()` | RISK-003: today every route is open and every answer has a different shape | `GET /` works, `POST /Account/login` works, a protected route without a token answers 401 |
| 3 | Hash the password with bcrypt and sign a real JWT in `AccountService` | RISK-002: plain-text passwords | the `users` table holds a bcrypt hash, `login` returns a token that the guard accepts |
| 4 | Replace the static Swagger document with `SwaggerModule.createDocument` | RISK-005: the decorator work is invisible | `/swagger` shows the real routes of `src/`, the legacy routes are marked deprecated |
| 5 | Build the Users module: `GET /users`, `GET /users/me`, `GET /users/{userId}` | first real feature on top of the database | the 3 endpoints work in Swagger with a Bearer token and appear as DONE in `API_CONTRACT.md` |

## Known bugs

| # | Bug | Where | Effect | Fix task |
|---|---|---|---|---|
| 1 | `type: 'sqlite'` is not a valid TypeORM 1.x driver | `src/config/database.config.ts:4` | `npm run build` fails with TS2322 | Next 5 tasks #1 |
| 2 | The database is never connected | `src/app.module.ts` | no table, no data | Next 5 tasks #1 |
| 3 | Guard, pipe, filter and interceptor are not registered | `src/app.module.ts`, `src/main.ts` | every route is public, errors are not wrapped | Next 5 tasks #2 |
| 4 | `JwtStrategy` is not a provider of `AccountModule`, `PassportModule` and `JwtModule` are missing | `src/modules/account/account.module.ts` | the JWT guard cannot work | Next 5 tasks #2 |
| 5 | No route uses `@Public()` | `src/modules/account/account.controller.ts` | after the guard is registered, login would answer 401 | Next 5 tasks #2 |
| 6 | The password is stored and compared in plain text | `src/modules/account/account.service.ts:33,48` | a database leak exposes every password | Next 5 tasks #3 |
| 7 | The users live in an array in the service | `src/modules/account/account.service.ts:15` | the data dies when the server restarts | Next 5 tasks #1 |
| 8 | `login` returns a mock token even for an unknown user | `src/modules/account/account.service.ts:46` | authentication is bypassed | Next 5 tasks #3 |
| 9 | The DTOs have no validator and no global `ValidationPipe` | `src/modules/account/dto/*` | any payload is accepted | Next 5 tasks #2 |
| 10 | The Account controller has only `@ApiTags` | `src/modules/account/account.controller.ts` | the real routes are undocumented in Swagger | Next 5 tasks #4 |
| 11 | `changePassword` takes no arguments and checks no token | `src/modules/account/account.controller.ts:32` | anybody can call it | Next 5 tasks #2 |
| 12 | Passwords and emails travel in the query string | `src/modules/account/account.controller.ts:22,27` | secrets end up in logs and browser history | Account task "move the password fields into the body" |
| 13 | The served Swagger is the static legacy `.NET` document | `src/main.ts:13`, `src/swagger.document.ts` | the client sees 57 routes that do not exist | Next 5 tasks #4 |
| 14 | `npm test` and `npm run lint` fail: native binding is not a valid Win32 application | `node_modules/@oxlint/*`, `node_modules/vite/node_modules/rolldown` | no automated check can run | Tests task "fix the broken native bindings" (`rm -rf node_modules package-lock.json && npm i`) |
| 15 | `tsconfig.build.tsbuildinfo` is stale and hides errors | `backend/tsconfig.build.tsbuildinfo` | a broken file can look fine | use `npx tsc -p tsconfig.build.json --noEmit --incremental false` |
| 16 | `uploads/` is never served as a static folder | `src/main.ts` | the uploaded files cannot be opened | Platform task "serve uploads/ as static files" |
| 17 | `ObserveModule.forRoot` uses the placeholders `YOUR_APP_KEY` / `YOUR_APP_SECRET` | `src/app.module.ts:15` | the telemetry is not connected | decide in `docs/OPEN_QUESTIONS.md` Q-08 |
| 18 | `src/modules/chats/` and `src/modules/locations/` do not exist | `src/modules/` | the contract has routes with no home | Chats and Locations tasks |
