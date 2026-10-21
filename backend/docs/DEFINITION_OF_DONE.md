# DEFINITION OF DONE — checklist for every task

| Field | Value |
|---|---|
| Version | v0.1 |
| Date | 2026-10-21 |
| Applies to | every code change and every documentation change |
| Rule | a task is done only when **all** boxes are ticked |

## 1. Code

- [ ] The code follows `CODING_RULES.md` (naming, DTO, validation, errors, status codes).
- [ ] No `any`, no `@ts-ignore`, no new npm package that is not needed.
- [ ] One module = one folder in `src/modules/` with controller + service + module + dto.
- [ ] The controller is thin: it reads the input and calls the service.
- [ ] The service throws the Nest exceptions (`NotFoundException`, `ConflictException`, `ForbiddenException`, `BadRequestException`).
- [ ] The current user id comes from `@CurrentUser()`, never from the body or the query.
- [ ] The relative imports end with `.js` (ESM + NodeNext).
- [ ] The entities are imported through `src/entities/index.ts`.

## 2. Validation and security

- [ ] Every new DTO field has a class-validator decorator.
- [ ] Every new DTO field has `@ApiProperty` / `@ApiPropertyOptional` with a description and an example.
- [ ] A global `ValidationPipe` with `whitelist` and `forbidNonWhitelisted` is in place.
- [ ] Passwords are hashed with bcrypt (≥ 10 rounds); no plain-text password anywhere.
- [ ] No secret, key or password is written in a source file.
- [ ] No password or token travels in a query string.
- [ ] A protected route checks the owner / the role before it changes or deletes anything.

## 3. Swagger

- [ ] The controller has `@ApiTags` and `@ApiBearerAuth` (unless the route is public).
- [ ] Every route has `@ApiOperation({summary, description})`.
- [ ] Every route has one success helper: `@ApiOkWrapped`, `@ApiCreatedWrapped` or `@ApiPagedWrapped`.
- [ ] Every route has `@ApiErrorResponses()` (400, 401, 403, 404, 409).
- [ ] Path parameters have `@ApiParam`, query parameters have `@ApiQuery`.
- [ ] Uploads have `@ApiConsumes('multipart/form-data')` and a body schema with `format: binary`.
- [ ] The path follows the route policy: plural, kebab-case, id in the path.
- [ ] The Swagger UI shows the new endpoint with a working "Try it out".

## 4. Tests

- [ ] The service has a unit test for the happy path and for every error of `API_CONTRACT.md`.
- [ ] The controller has a test for the status codes.
- [ ] A P0 flow has an e2e test.
- [ ] The tests pass and they do not depend on each other or on their order.
- [ ] The tests use a separate SQLite file, never `data/app.sqlite`.

## 5. Build and checks

- [ ] `npm run build` → 0 TypeScript errors.
- [ ] `npx tsc -p tsconfig.build.json --noEmit --incremental false` → 0 errors.
- [ ] `npm run lint` → 0 errors (blocked by the broken native binding, see `TASKS.md` bug 14).
- [ ] `npm test` and `npm run test:e2e` → all green (same blocker).
- [ ] The server starts and the new endpoint answers in Swagger with the documented status code.

## 6. Documentation

- [ ] `API_CONTRACT.md` — the status of the endpoint is updated (TODO → DONE / PARTIAL).
- [ ] `docs/TZ.md` — the status of the matching FR is updated.
- [ ] `docs/TRACEABILITY.md` — the row of the FR is updated.
- [ ] `DATABASE.md` — a new entity or a new field is documented, with the ER diagram.
- [ ] `docs/NFR.md` — a new non-functional rule is added if the change touches security, performance or files.
- [ ] `docs/RISKS.md` — a new risk is added if the change creates one.
- [ ] `docs/OPEN_QUESTIONS.md` — an unknown is written there instead of being invented.
- [ ] `docs/DECISIONS.md` — a choice made during the task is recorded.

## 7. Task tracking

- [ ] `TASKS.md` — the box of the task is ticked `[x]`.
- [ ] `TASKS.md` — "Next 5 tasks" is updated and the next task is on top.
- [ ] `TASKS.md` — "Known bugs" is updated (a fixed bug is removed, a new one is added).
- [ ] `CHANGELOG.md` — one line is added under the current version.
- [ ] `docs/ROADMAP.md` — a delivered item is marked as done.

## 8. Sign-off

| Field | Value |
|---|---|
| Task | |
| Author | |
| Date | |
| Build | pass / fail |
| Tests | pass / fail |
| Docs | updated / not needed |
| `TASKS.md` | updated |
