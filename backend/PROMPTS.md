# PROMPTS — reusable prompts for this project

| Field | Value |
|---|---|
| Version | v0.1 |
| Date | 2026-10-21 |
| Usage | copy a prompt, replace `<...>`, run it in the AI tool of the workspace |

Every prompt below starts from the reading order of `CLAUDE.md` and ends with
the update of `TASKS.md`.

## P-01 Add a module

**Goal** — create a new module with the full folder, the DTOs, the entity usage,
the Swagger documentation and the tests.  **Use when** — a new module folder must be filled (users, follows, posts, …).

```text
Work in backend/. Read CLAUDE.md, about.md, docs/TZ.md, API_CONTRACT.md,
ARCHITECTURE.md, CODING_RULES.md and SWAGGER_RULES.md first.
Create the module <module> in src/modules/<module>/ with:
- <module>.module.ts, <module>.controller.ts, <module>.service.ts
- one DTO per file in dto/, every field with a class-validator decorator and
  @ApiProperty with description and example
- the endpoints listed in API_CONTRACT.md for this module, with the exact
  method and path from that table
- @ApiTags, @ApiOperation, one success helper (ApiOkWrapped / ApiCreatedWrapped
  / ApiPagedWrapped) and @ApiErrorResponses on every route
- the current user id taken from @CurrentUser(), never from the body
- unit tests for the service
Do not change business rules that are not written in docs/TZ.md.
Then update API_CONTRACT.md (status DONE), docs/TZ.md (FR status),
docs/TRACEABILITY.md, TASKS.md and CHANGELOG.md.
```

## P-02 Fix a bug

**Goal** — find the real cause of a bug and fix it without breaking the contract.  **Use when** — something throws, returns the wrong data, or the build is red.

```text
Work in backend/. Read CLAUDE.md and TASKS.md (section "Known bugs").
Bug: <symptom and how to reproduce it>.
Steps:
1. Reproduce the bug and state the exact error message.
2. Find the root cause in the source. Do not guess: quote the file and the line.
3. Write a failing test that shows the bug (unit test preferred).
4. Fix the code with the smallest possible change.
5. Run npm run build and the tests. Fix what you broke.
6. Update TASKS.md (Known bugs + the ticked task) and CHANGELOG.md.
Do not change any route path and do not change the response shape.
```

## P-03 Add an endpoint

**Goal** — add one endpoint that follows the contract exactly.  **Use when** — a single new route is needed inside an existing module.

```text
Work in backend/. Read CLAUDE.md, API_CONTRACT.md, CODING_RULES.md and
SWAGGER_RULES.md.
Add the endpoint <METHOD> <path> to the module <module>.
Contract row from API_CONTRACT.md: <paste the row>.
Requirements:
- the DTO with a validator per field and @ApiProperty with example
- @ApiOperation({summary, description}), the success helper for the status code
  and @ApiErrorResponses()
- the current user id from @CurrentUser()
- the service returns the data, the interceptor wraps it
- a unit test for the service and, if it is a P0 flow, an e2e test
Update API_CONTRACT.md (status DONE), docs/TZ.md, docs/TRACEABILITY.md,
TASKS.md, CHANGELOG.md.
```

## P-04 Safe refactor

**Goal** — change the structure without changing the behaviour.  **Use when** — the code must be cleaned up without breaking the client.

```text
Work in backend/. Read CLAUDE.md, CODING_RULES.md and API_CONTRACT.md.
Refactor <file or module> to <target state>.
Hard rules:
- the public behaviour stays identical: same routes, same status codes, same
  response shape {statusCode, data, errors}, same field names
- no new abstraction layer (no UseCase, no Mapper, no RepositoryInterface)
- no `any`, no @ts-ignore, no new dependency
- every step compiles: npm run build must pass after each step
- the tests must pass before and after
List the files you will touch, do the change, run the build and the tests,
then report the diff in one paragraph.
```

## P-05 Write tests

**Goal** — add the missing tests for a module or a flow.  **Use when** — a module is built and has no test yet.

```text
Work in backend/. Read CLAUDE.md, TESTING.md and docs/USE_CASES.md.
Write tests for <module or flow>.
Rules:
- one behaviour per test, name = a full sentence
- Arrange / Act / Assert with blank lines between the blocks
- the service is unit tested with a mocked repository
- the flow is tested e2e with supertest against a separate SQLite file
- cover the happy path and every error of API_CONTRACT.md for these routes
- no test depends on another test or on the order
Run npm test and npm run test:e2e and report the result.
Update TASKS.md (Tests section).
```

## P-06 Review the code

**Goal** — a review against the rules of this project.  **Use when** — a feature is ready for review.

```text
Work in backend/. Read CLAUDE.md, CODING_RULES.md, SWAGGER_RULES.md,
API_CONTRACT.md and docs/DEFINITION_OF_DONE.md.
Review the changes in <git range or folder>.
Check, and report one line per finding, with file:line:
1. any `any`, any @ts-ignore, any missing validator on a DTO field
2. routes that break the route policy (plural, kebab-case, id in the path)
3. endpoints without @ApiTags / @ApiOperation / a success helper / error responses
4. responses that do not use {statusCode, data, errors}
5. the current user id taken from the body or the query
6. status codes that do not match the method
7. missing error handling (no NotFoundException / ConflictException)
8. missing or wrong documentation updates
Sort the findings by severity: blocker, major, minor, nit.
Do not change the code. Only report.
```

## P-07 Update the Swagger only

**Goal** — fix the documentation of the API without touching the behaviour.  **Use when** — the code works but Swagger shows nothing useful.

```text
Work in backend/. Read CLAUDE.md, SWAGGER_RULES.md and API_CONTRACT.md.
Task: <which endpoints>.
Rules:
- DO NOT change the business logic, the routes, the DTO field names or the
  response shape
- DO add or fix @ApiTags, @ApiOperation, @ApiParam, @ApiQuery, @ApiBody,
  @ApiConsumes, @ApiProperty and the success/error helpers
- DO use @ApiOkWrapped / @ApiCreatedWrapped / @ApiPagedWrapped / @ApiErrorResponses
- DO keep the contract of API_CONTRACT.md: same method, same path, same status
Run npm run build. Report the endpoints you touched.
```

## P-08 Continue the unfinished work

**Goal** — pick up the project where it stopped.  **Use when** — the session continues after a break.

```text
Work in backend/. Read CLAUDE.md, TASKS.md (section "Next 5 tasks") and
docs/ROADMAP.md.
Take the FIRST unchecked task of "Next 5 tasks".
- implement it completely, following CODING_RULES.md and SWAGGER_RULES.md
- add the tests of TESTING.md §5 for this task
- run npm run build and the tests
- update API_CONTRACT.md, docs/TZ.md, docs/TRACEABILITY.md, TASKS.md, CHANGELOG.md
- move the next task up in "Next 5 tasks" and update the Known bugs section
If the task is blocked by an open question of docs/OPEN_QUESTIONS.md, stop, pick
the most reasonable default, write it in docs/DECISIONS.md and continue.
```

## P-09 Update the docs from the code

**Goal** — make the documentation match the code again.  **Use when** — the code moved forward and the docs stayed behind.

```text
Work in backend/. Read CLAUDE.md, then read all the source files of <module>.
Compare the code with API_CONTRACT.md, docs/TZ.md, docs/TRACEABILITY.md and
DATABASE.md.
- every endpoint that exists in the code must exist in API_CONTRACT.md with the
  same method, path, status and body
- every endpoint of API_CONTRACT.md must exist in the code or stay TODO
- every FR of docs/TZ.md must have a row in docs/TRACEABILITY.md
- every entity field must match DATABASE.md
- fix the statuses first, then the wording
Do NOT change the source code. Report every difference you fixed.
```

## P-10 Release check

**Goal** — check that the project can be delivered.  **Use when** — a version is about to be tagged.

```text
Work in backend/. Read CLAUDE.md, docs/DEFINITION_OF_DONE.md, docs/NFR.md,
docs/RISKS.md and CHANGELOG.md.
Release check:
1. npm run build → 0 errors
2. npx tsc -p tsconfig.build.json --noEmit --incremental false → 0 errors
3. npm run lint → 0 errors
4. npm test and npm run test:e2e → all green
5. every endpoint of API_CONTRACT.md marked DONE works in Swagger
6. no password in plain text in the database, no secret in the code
7. every endpoint has a success schema and the 5 error schemas
8. docs/TRACEABILITY.md has no TODO left for a P0 requirement
9. TASKS.md, CHANGELOG.md, docs/ROADMAP.md are up to date
Output a table: check | result | what to fix.
Do not fix anything without saying it first.
```
