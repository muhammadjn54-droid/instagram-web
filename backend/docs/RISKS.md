# RISKS — Instagram-like Social Network API

| Field | Value |
|---|---|
| Version | v0.1 |
| Date | 2026-10-21 |
| Scale | Probability 1–5 (5 = likely), Impact 1–5 (5 = breaks the demo) |

## 1. Risk register

| ID | Risk | Probability | Impact | Score | Prevention | Contingency |
|---|---|---|---|---|---|---|
| RISK-001 | Build is red: `src/config/database.config.ts` uses `type: 'sqlite'`, TypeORM 1.x accepts only `better-sqlite3` | 5 | 4 | 20 | Fix the driver name and connect `TypeOrmModule.forRoot(databaseConfig)` in `app.module.ts` before adding features | Task `TASKS.md` → Platform: "Fix DB config and wire TypeORM" |
| RISK-002 | Passwords are stored and compared in plain text in `account.service.ts` | 5 | 5 | 25 | FR-007: hash with `bcryptjs` (10 rounds) at register, compare with `bcrypt.compare` at login | Reset all test passwords after the fix, never reuse the demo account |
| RISK-003 | `JwtAuthGuard`, `HttpExceptionFilter` and `ResponseInterceptor` exist but are never registered | 5 | 5 | 25 | Register all three globally in `main.ts` (`APP_GUARD`, `APP_FILTER`, `APP_INTERCEPTOR`) | Add them one by one and re-run the flow of `TESTING.md` §3 |
| RISK-004 | The database is never used: `AccountService` keeps users in an array, so data dies on restart | 5 | 4 | 20 | Move the service to TypeORM repositories as soon as the connection works | Document the mock behaviour in Swagger until then |
| RISK-005 | The served Swagger is the static legacy `.NET` file, so decorator work is invisible to the client | 4 | 4 | 16 | Replace the static document with `SwaggerModule.createDocument(app, config)` in `main.ts` | Keep `swagger.old.json` as a feature checklist, not as the served document |
| RISK-006 | 52 of 57 planned endpoints do not exist | 5 | 4 | 20 | Work module by module using `TASKS.md` "Next 5 tasks" and `API_CONTRACT.md` | Ship the P0 endpoints first, P1 later |
| RISK-007 | No input validation: `RegisterDto` and `LoginDto` have no class-validator decorators and no `ValidationPipe` | 5 | 4 | 20 | Add a global `ValidationPipe` with `whitelist` + `forbidNonWhitelisted` (NFR-010) | Validate inside the service as a second layer |
| RISK-008 | New routes may copy the legacy style (`/Post/get-post-by-id`) instead of the REST policy | 4 | 3 | 12 | Every new endpoint in `API_CONTRACT.md` already has its REST path; reviewers compare with the contract | Rename before merging, the contract is the reference |
| RISK-009 | Legacy routes and new REST routes for the same action → two ways to do the same thing | 3 | 3 | 9 | Keep the 5 legacy `/Account/*` routes untouched; all new actions exist only in the REST form | Mark legacy routes as deprecated in Swagger later |
| RISK-010 | No rate limiting, so the login endpoint can be brute-forced | 4 | 4 | 16 | Add `@nestjs/throttler` with the limits of NFR-012…NFR-014 | Add a temporary counter in the auth guard |
| RISK-011 | File upload has no size or type limit → disk can be filled | 3 | 4 | 12 | Multer `limits: { fileSize: 10 MB }` plus a mime-type whitelist (NFR-020, NFR-029) | Delete the `uploads/` folder manually in development |
| RISK-012 | SQLite cannot handle many concurrent writes; it locks the whole file | 3 | 3 | 9 | Keep write volume low, add indexes on foreign keys | Move to PostgreSQL before the project is used in production |
| RISK-013 | `synchronize: true` can destroy data when an entity changes | 3 | 4 | 12 | Use `synchronize: false` outside development and add migrations | Daily backup of `data/app.sqlite` (NFR-035) |
| RISK-014 | The frontend (`frontend/`, Next.js) is built against endpoints that do not exist yet | 4 | 3 | 12 | Freeze `API_CONTRACT.md` for the P0 flows before the frontend work starts | Answer the frontend with a mock server |
| RISK-015 | The toolchain is broken on this machine: `npm run lint` and `npm run test` fail with native-binding errors | 4 | 2 | 8 | `npm i` after removing `node_modules` and `package-lock.json`, as the npm error message says | Continue with `npm run build` and manual Swagger checks (see `TESTING.md`) |
| RISK-016 | Story expiry is not enforced automatically; old stories stay in the table | 4 | 3 | 12 | Filter by `expiresAt > now` in every story query | A daily cleanup job that deletes expired stories |
| RISK-017 | The `Admin` role has no column in `users`, so admin endpoints cannot be protected | 4 | 2 | 8 | Decide Q-01 in `docs/OPEN_QUESTIONS.md` before building admin endpoints | Keep admin endpoints out of the MVP |

## 2. Assumptions

| ID | Assumption |
|---|---|
| ASM-01 | SQLite is enough for the demo and for the tests. |
| ASM-02 | `frontend/` is a Next.js app that will consume this API over HTTP with a Bearer token. |
| ASM-03 | `src/swagger.old.json` (57 .NET-style endpoints) defines the feature set, not the URL scheme. |
| ASM-04 | The legacy `/Account/*` routes stay reachable, so the frontend is not broken by this documentation work. |
| ASM-05 | The project stays a single NestJS monolith (see `what.shuld.donotuse.md` §1.1). |

## 3. Constraints

| ID | Constraint |
|---|---|
| CON-01 | No microservices, no CQRS, no message brokers. |
| CON-02 | No `any`, no `@ts-ignore`. |
| CON-03 | One module = one folder under `src/modules/`. |
| CON-04 | A docs-only task must not change business logic. |
| CON-05 | Every response uses the `{statusCode, data, errors}` wrapper. |
| CON-06 | The current user id comes only from the JWT. |

## 4. Risk handling order

1. RISK-002, RISK-003, RISK-001 — they block everything else.
2. RISK-004, RISK-006, RISK-007 — they define the first usable release.
3. RISK-005, RISK-008, RISK-009 — they keep the contract clean.
4. The rest — handle them before the matching module is built.
