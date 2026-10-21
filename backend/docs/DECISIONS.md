# DECISIONS — choices made while writing the documentation

| Field | Value |
|---|---|
| Version | v0.1 |
| Date | 2026-10-21 |
| Rule | every decision is written here when the task does not ask a question |

| ID | Decision | Reason | Date |
|---|---|---|---|
| D-01 | The documentation set lives in `backend/`, not in the monorepo root | `backend/` holds `about.md`, `src/` and `package.json`; the task described the project as "my NestJS API" and pointed to `src/swagger.old.json` | 2026-10-21 |
| D-02 | The 5 legacy `/Account/*` routes keep their names; only new routes follow the REST policy | the frontend may already call them, and the task forbids changing working code in a docs-only pass | 2026-10-21 |
| D-03 | `src/swagger.old.json` is a feature checklist, not a URL contract | the task says it explicitly; 52 of its 57 routes are rewritten in REST style in `API_CONTRACT.md` | 2026-10-21 |
| D-04 | The status column uses DONE / PARTIAL / TODO | DONE alone would hide that 5 endpoints are stubs; PARTIAL keeps the truth without inventing a second word | 2026-10-21 |
| D-05 | Product and requirement documents go in `docs/`, technical documents stay at the root of the workspace | the task names the `docs/` prefix explicitly for PRD, TZ, NFR, glossary, risks, DoD, roadmap and traceability | 2026-10-21 |
| D-06 | The monorepo-root `what.shuld.donotuse.md` becomes a 10-line pointer to `backend/what.shuld.donotuse.md` | two copies of the same rules would contradict each other; the full rules are kept, not deleted | 2026-10-21 |
| D-07 | New REST paths were derived from the reference routes, with 5 extra endpoints | the reference is a .NET API with verb-style paths; the route policy of `about.md` §3 requires plural, kebab-case and ids in the path | 2026-10-21 |
| D-08 | Pagination defaults: `pageNumber = 1`, `pageSize = 10`, maximum 100 | a safe default that fits both the mobile and the web client, and it is stated as a number in NFR-025 | 2026-10-21 |
| D-09 | A story expires exactly 24 h after `createdAt`, filtered in the query | the entity has an `expiresAt` column; no cron job is needed for the demo, and the cleanup job is a v1.5 item | 2026-10-21 |
| D-10 | In a chat, `user1Id` is always the smaller id of the pair | it gives a stable key for the "one chat per pair" check without a unique constraint, which the entity does not have yet | 2026-10-21 |
| D-11 | The response interceptor accepts both a plain value and an already wrapped object | `src/common/interceptors/response.interceptor.ts` already checks the 3 keys; the existing Account service returns the wrapper, so it keeps working | 2026-10-21 |
| D-12 | `CODING_RULES.md` says the service returns plain data and the interceptor wraps it | that is the target architecture; rule 11 keeps the interceptor compatible with the current code | 2026-10-21 |
| D-13 | The Admin role is out of the MVP; the admin routes are marked TODO | `users` has no `role` column and the task forbids inventing source code; the question is raised as Q-01 | 2026-10-21 |
| D-14 | The `locations` write routes are marked "Bearer (admin)" | the reference spec has no role, but a location must not be writable by anybody; the admin check is a TODO | 2026-10-21 |
| D-15 | The FR ids are grouped by module with gaps: 001–008, 010–017, 020–025, 030–034, 040–049, 050–053, 060–063, 070–078, 080–087, 090–094, 100–106 | the gaps leave room to add a module without renumbering, and the ids stay stable | 2026-10-21 |
| D-16 | The user story ids follow the same grouping: 001–005, 010–015, 020–024, 030–034, 040–044, 050–054, 060–064, 070–074, 080–084, 090–094, 100–104 | same reason as D-15; 55 stories in 11 modules | 2026-10-21 |
| D-17 | The upload limits are 10 MB per file and 10 files per post | the reference spec allows an array of images on a post; 10 images and 10 MB is a common demo limit and it is written as a number | 2026-10-21 |
| D-18 | `npm run seed` is documented as TODO, not invented | the script does not exist in `package.json`; inventing a command would break the "never invent" rule | 2026-10-21 |
| D-19 | The build error and the broken lint/test toolchain are documented, not fixed | the task says "do not change any source code"; both are listed in `TASKS.md` → Known bugs with the fix | 2026-10-21 |
| D-20 | The "Next 5 tasks" order is: database → platform wiring → bcrypt + JWT → Swagger → users module | it unblocks the most FRs in the fewest steps and follows the order of `docs/ROADMAP.md` | 2026-10-21 |
| D-21 | The `id` of every entity is an integer, not a uuid | every entity uses `@PrimaryGeneratedColumn()` in the real code, and the DTOs of the reference spec use `int32` | 2026-10-21 |
| D-22 | The screenshots / Postman collection are v1.5 items | they need a working OpenAPI document first | 2026-10-21 |
| D-23 | The error code table (400/401/403/404/409/413/429) is the single source for every document | several documents need the same codes; one table avoids contradictions | 2026-10-21 |
| D-24 | `GET /users/me`, `GET /users/{userId}`, `DELETE /posts/{postId}/likes`, `GET /posts/{postId}/comments` and `DELETE /favorites/{postId}` are new routes | the reference spec has no way to read a user, to unlike a post, to list the comments or to unsave a post, and the stories require them | 2026-10-21 |
