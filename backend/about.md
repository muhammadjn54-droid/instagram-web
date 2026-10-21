# About — Instagram-like Social Network API (NestJS)

| Field | Value |
|---|---|
| Project | Instagram-like Social Network API |
| Workspace | `backend/` (NestJS API). `frontend/` is a Next.js client. |
| Version | v0.1 |
| Date | 2026-10-21 |
| Docs owner | backend team |

> All documentation for the API lives in this workspace. Reading order: `CLAUDE.md`.
> Requirement IDs: `FR-xxx` functional, `NFR-xxx` non-functional, `US-xxx` user story,
> `UC-xxx` use case, `RISK-xxx` risk, `D-xxx` decision, `Q-xx` open question.

## 1. Goal

REST API for an Instagram-like app: accounts, profiles, posts (images), reels,
stories (24 h), likes, comments, favorites, follows, direct chat, search history,
locations.

## 2. Stack (real, from `package.json`)

| Layer | Package | Version |
|---|---|---|
| Framework | `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express` | ^12.0.1 |
| Auth | `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt` | ^12.0.3 / ^12.0.0 / ^4.0.1 |
| Password hash | `bcryptjs` | ^3.0.3 (installed, **not used yet**) |
| ORM | `typeorm` + `@nestjs/typeorm` | ^1.1.2 / ^12.0.2 |
| DB driver | `better-sqlite3` | ^12.11.1 |
| Docs | `@nestjs/swagger`, `swagger-ui-express` | ^12.0.2 / ^5.0.1 |
| Validation | `class-validator`, `class-transformer` | ^0.15.1 / ^0.5.1 |
| Tests | `vitest`, `supertest` | ^4.1.2 / ^7.0.0 |
| Lint / format | `oxlint`, `prettier` | ^1.58.0 / ^3.4.2 |
| Module system | ESM (`"type": "module"`), NodeNext resolution, `.js` import suffix | — |

## 3. Route policy

1. New routes use REST style: plural nouns, kebab-case, lowercase, e.g. `GET /posts/{postId}`.
2. IDs live in the path (`{postId}`), never in the query string.
3. `POST` = create, `GET` = read, `PUT`/`PATCH` = update, `DELETE` = remove.
4. Legacy routes that already exist in `src/modules/account/` are **kept as-is**
   (`/Account/register`, `/Account/login`, `/Account/ForgotPassword`,
   `/Account/ResetPassword`, `/Account/ChangePassword`). Do not rename them in a
   docs-only or Swagger-only task. New work does not copy this style.
5. `src/swagger.old.json` (and `src/abaut.md`, `src/swagger.json`,
   `src/swagger.document.ts`) are a **feature reference, not a URL contract**.
   They list 57 legacy .NET-style endpoints. New routes are defined in
   `API_CONTRACT.md`.

## 4. Global rules (ALWAYS follow)

1. Every endpoint must have: `@ApiTags`, `@ApiOperation({summary, description})`,
   `@ApiResponse` for success AND errors (400, 401, 403, 404, 409 where relevant).
2. Every DTO property must have `@ApiProperty` / `@ApiPropertyOptional` with
   description, example, and class-validator decorators.
3. All responses use one wrapper: `ApiResponse<T> = { statusCode, data, errors }`.
   Use the generic helpers `@ApiOkWrapped(Model)` / `@ApiCreatedWrapped(Model)` /
   `@ApiPagedWrapped(Model)` from `src/common/decorators/swagger-wrapped.decorator.ts`.
4. Authentication: JWT Bearer (`http/bearer/JWT`). Register, login, forgot/reset
   password are public (`@Public()`). Everything else needs auth.
5. The current user id ALWAYS comes from the JWT (`@CurrentUser()`), never from
   query/body.
6. Never send passwords or tokens in the query string. Use the request body.
7. Pagination: query `pageNumber`, `pageSize`; response `PagedResult<T>`
   = `{ items, totalCount, pageNumber, pageSize, totalPages }`.
8. Dates: ISO 8601, field names `createdAt`, `updatedAt`.
9. File upload: `multipart/form-data`, with `@ApiConsumes` and `@ApiBody` schema
   (`format: binary`).
10. Swagger UI at `/swagger`, JSON at `/swagger-json`. API title: "Instagram Clone API".
11. Do not change business logic when updating Swagger; only fix docs unless I say
    otherwise.
12. After any change: project must compile with no TypeScript errors.
13. Never use `any`. No `@ts-ignore`. Plain-text passwords are forbidden.
14. One module = one folder under `src/modules/`. No 10-layer abstraction.
15. Update `TASKS.md` after every task (see `docs/DEFINITION_OF_DONE.md`).

## 5. Modules

| Module | Folder | Code status (2026-10-21) |
|---|---|---|
| Account (auth) | `src/modules/account/` | DONE (mock service, no DB) |
| Users | `src/modules/users/` | folder only |
| Profiles | `src/modules/profiles/` | folder only |
| Follows | `src/modules/follows/` | folder only |
| Posts | `src/modules/posts/` | folder only |
| Comments | `src/modules/comments/` | folder only |
| Favorites | `src/modules/favorites/` | folder only |
| Stories | `src/modules/stories/` | folder only |
| Chats | `src/modules/chats/` — **not created yet** | missing |
| Locations | `src/modules/locations/` — **not created yet** | missing |
| Search history | `src/modules/search-history/` | folder only |

## 6. Folder pattern per module

```text
src/modules/<module>/
  dto/                       # request DTOs (class-validator + @ApiProperty)
  <module>.controller.ts     # HTTP layer only
  <module>.service.ts        # business logic only
  <module>.module.ts         # @Module wiring
```

Shared code lives in `src/common/` (decorators, guards, filters, interceptors,
response wrappers) and `src/entities/` (TypeORM entities, barrel file `index.ts`).

## 7. Where to read more

| Need | File |
|---|---|
| Requirements | `docs/TZ.md` |
| API contract | `API_CONTRACT.md` |
| Database | `DATABASE.md` |
| Architecture | `ARCHITECTURE.md` |
| Code style | `CODING_RULES.md` |
| Swagger style | `SWAGGER_RULES.md` |
| Product | `docs/PRD.md` |
| Stories / flows | `docs/USER_STORIES.md`, `docs/USE_CASES.md` |
| Quality | `docs/NFR.md`, `docs/RISKS.md`, `docs/GLOSSARY.md` |
| Work items | `TASKS.md`, `docs/ROADMAP.md`, `docs/TRACEABILITY.md` |
| Done when | `docs/DEFINITION_OF_DONE.md` |
| Why / unknown | `docs/DECISIONS.md`, `docs/OPEN_QUESTIONS.md` |
| History | `CHANGELOG.md`, `TESTING.md`, `PROMPTS.md` |
