# NFR — Non-functional requirements

| Field | Value |
|---|---|
| Version | v0.1 |
| Date | 2026-10-21 |
| Rule | Every number below is a testable target |

## 1. Security

| ID | Requirement | Target | How to test |
|---|---|---|---|
| NFR-001 | Password storage | bcrypt, 10 rounds minimum, salt per user | read the `users` table, no plain text |
| NFR-002 | Password policy | 8–72 characters, at least 1 letter and 1 digit | POST with a 7-char password → 400 |
| NFR-003 | Transport | HTTPS only in production; `Strict-Transport-Security: max-age=31536000` | request over http in prod → redirect |
| NFR-004 | JWT algorithm | HS256 only, `algorithms` whitelist in the strategy | token signed with `none` → 401 |
| NFR-005 | JWT lifetime | access token 15 min, refresh token 7 days | decode the token and compare `exp - iat` |
| NFR-006 | JWT secret | from `JWT_SECRET` env var, ≥ 32 characters, never committed | `.env` is in `.gitignore`, no secret in `src/` |
| NFR-007 | Password reset token | random ≥ 32 bytes, expires in 60 min, single use | use the token twice → 400 |
| NFR-008 | Bearer token transport | `Authorization` header only, never in a query string | grep the codebase for `?token=` → 0 hits |
| NFR-009 | Authorization by ownership | only the owner can delete a post, story, comment, chat, message | other user's id → 403 |
| NFR-010 | Mass assignment | `whitelist: true` + `forbidNonWhitelisted: true` in `ValidationPipe` | send an unknown field → 400 |
| NFR-011 | SQL injection | only TypeORM parameters, no raw string concatenation | grep for `query(` with template literals → 0 hits |
| NFR-012 | Rate limit, auth routes | max 10 requests per minute per IP on register/login/forgot/reset | 11th request in a minute → 429 |
| NFR-013 | Rate limit, write routes | max 60 requests per minute per user for POST/PUT/DELETE | 61st request → 429 |
| NFR-014 | Rate limit, read routes | max 300 requests per minute per user | 301st request → 429 |
| NFR-015 | Input validation | 100% of DTO fields carry a class-validator decorator | review every DTO in `src/modules/*/dto/` |
| NFR-016 | Error body | no stack trace, no SQL text, no file path in `errors[]` | force a 500 and read the body |
| NFR-017 | Secrets in logs | passwords, tokens and reset tokens are never logged | grep the logs after login |
| NFR-018 | CORS | allow-list of origins from `CORS_ORIGINS`, not `*` in production | request from another origin → blocked |
| NFR-019 | Admin endpoints | admin role checked server-side, never trusted from the body | send `role: "admin"` in the body → ignored |
| NFR-020 | File upload type | only jpg, jpeg, png, webp, mp4 by mime type and extension | upload a `.exe` → 400 |

## 2. Performance

| ID | Requirement | Target | How to test |
|---|---|---|---|
| NFR-021 | List endpoint latency | p95 ≤ 100 ms with 10 000 rows in SQLite | `EXPLAIN QUERY PLAN` + timing |
| NFR-022 | Read-one latency | p95 ≤ 50 ms | timer around the service call |
| NFR-023 | Write latency | p95 ≤ 150 ms for a post with 10 images | timer around the service call |
| NFR-024 | Cold start | the server is listening ≤ 5 s after `npm run start` | stopwatch on the log line |
| NFR-025 | Pagination | max page size 100, default 10, `pageNumber` ≥ 1 | `pageSize=1000` → 400 |
| NFR-026 | Query count per list endpoint | ≤ 3 SQL queries (count + page + relations) | enable TypeORM logging |
| NFR-027 | Indexes | every foreign key column has an index | check `post_likes(postId, userId)`, `follows(followerId, followingId)` |
| NFR-028 | Image serving | static files are served with `Cache-Control: public, max-age=86400` | request an uploaded file and read the header |

## 3. Storage and uploads

| ID | Requirement | Target | How to test |
|---|---|---|---|
| NFR-029 | Max upload size | 10 MB per file, 10 files per post, 1 file per story | upload an 11 MB file → 413 |
| NFR-030 | Uploaded files | stored under `backend/uploads/`, url is `/uploads/<name>` | check the folder after upload |
| NFR-031 | File names | random UUID + original extension, never the original name | two uploads of `a.png` get different urls |
| NFR-032 | Storage quota | the demo database stays under 500 MB | `du -sh backend/data backend/uploads` |
| NFR-033 | Database file | SQLite file `backend/data/app.sqlite` | the file exists after start |
| NFR-034 | Schema | `synchronize: true` in development, migrations in production | `database.config.ts` |
| NFR-035 | Database backup | copy `app.sqlite` to `backups/app-<date>.sqlite` once a day, keep 7 copies | the script `scripts/backup.sh` exists and runs |

## 4. Logging and observability

| ID | Requirement | Target | How to test |
|---|---|---|---|
| NFR-036 | Request log | one line per request: method, path, status, duration in ms, userId | tail the console output |
| NFR-037 | Log level | `error` and `warn` in production, `debug` in development | `console.log` is replaced by a Logger |
| NFR-038 | Correlation id | every request gets a uuid, returned in the `x-request-id` header | call any endpoint and read the header |
| NFR-039 | No sensitive data in logs | no password, token or reset token in any log line | grep the logs after register and login |
| NFR-040 | Health check | `GET /` answers 200 in ≤ 100 ms | curl the root path |
| NFR-041 | Tracing | Nest Observe module is registered and reports errors | the error appears in the Observe dashboard |
| NFR-042 | Error telemetry | every 5xx is reported with the route and the userId | force a 500 and check Observe |

## 5. Versioning and compatibility

| ID | Requirement | Target | How to test |
|---|---|---|---|
| NFR-043 | API version in the path | `/api/v1` prefix from v1.0.0 on | see `Q-07` in `docs/OPEN_QUESTIONS.md` |
| NFR-044 | Breaking change policy | a removed or renamed field or route needs a new major version | check the changelog |
| NFR-045 | Additive change policy | a new optional field or a new route does not need a new version | check the changelog |
| NFR-046 | Response wrapper stability | the 3 keys `statusCode`, `data`, `errors` never change shape | compare 2 responses |
| NFR-047 | Date format | ISO 8601 with `Z`, e.g. `2026-10-21T18:17:00.000Z` | read `createdAt` in a response |
| NFR-048 | Deprecation notice | a deprecated route answers 200 and adds the `deprecation` header | request a deprecated route |
| NFR-049 | Swagger as the contract | `/swagger` and `/swagger-json` show every endpoint of `API_CONTRACT.md` | compare the two lists |
| NFR-050 | Node version | Node.js 20 LTS or newer | `node -v` |

## 6. Quality gates

| ID | Requirement | Target | How to test |
|---|---|---|---|
| NFR-051 | Build | `npm run build` → 0 TypeScript errors | build log |
| NFR-052 | Lint | `npm run lint` → 0 errors | lint output |
| NFR-053 | Unit tests | every module service has at least 1 test file | `npm test` |
| NFR-054 | E2E tests | the 10 flows of `docs/USE_CASES.md` have at least 1 e2e test each | `npm run test:e2e` |
| NFR-055 | Coverage | ≥ 60% lines for `src/modules/**` | `npm run test:cov` |
| NFR-056 | Definition of done | every task passes `docs/DEFINITION_OF_DONE.md` | review |
| NFR-057 | No `any` | 0 occurrences of `: any` or `as any` in `src/` | grep |
| NFR-058 | Docs freshness | `docs/TRACEABILITY.md` matches `API_CONTRACT.md` and the code | review |
