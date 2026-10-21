# CLAUDE.md — read me first

> Workspace: `backend/` (NestJS API). `frontend/` is the Next.js client.
> Snapshot: 2026-10-21. All paths are relative to `backend/`.

## 1. Reading order

1. `about.md` — goal, stack, global rules, route policy
2. `what.shuld.donotuse.md` — what is banned and why
3. `docs/TZ.md` — requirements FR-001…FR-106, business rules, acceptance criteria
4. `API_CONTRACT.md` — every endpoint: method, path, auth, request, response, status
5. `ARCHITECTURE.md` — real folder tree, request flow, "how to add a module"
6. `DATABASE.md` — 16 entities, constraints, ER diagram
7. `CODING_RULES.md` — naming, DTO, validation, errors, GOOD/BAD examples
8. `SWAGGER_RULES.md` — controller template + endpoint checklist
9. `docs/PRD.md`, `docs/USE_CASES.md`, `docs/USER_STORIES.md`, `docs/NFR.md`, `docs/GLOSSARY.md`, `docs/RISKS.md`
10. `docs/ROADMAP.md`, `docs/TRACEABILITY.md`, `docs/DEFINITION_OF_DONE.md`, `docs/DECISIONS.md`, `docs/OPEN_QUESTIONS.md`
11. `TASKS.md`, `TESTING.md`, `PROMPTS.md`, `CHANGELOG.md`

## 2. The 10 most important rules

1. New routes: plural nouns, kebab-case, ids in the path. Legacy `/Account/*` stays as it is.
2. Every response is `{statusCode, data, errors}` — never a bare object.
3. The current user id comes only from `@CurrentUser()` (the JWT), never from body or query.
4. Every DTO field needs a class-validator decorator **and** `@ApiProperty` with example.
5. Every endpoint needs `@ApiTags`, `@ApiOperation`, one success helper and `@ApiErrorResponses()`.
6. Passwords are bcrypt hashes only (≥10 rounds). No plain text, ever.
7. No `any`, no `@ts-ignore`, no microservices, no extra layers.
8. One module = one folder in `src/modules/` with controller + service + module + dto.
9. A docs-only task must not change business logic.
10. **Update `TASKS.md` after every task**, and pass `docs/DEFINITION_OF_DONE.md`.

## 3. Commands

| What | Command | Note |
|---|---|---|
| dev server | `npm run start:dev` | http://localhost:3000, Swagger at `/swagger` |
| build | `npm run build` | currently fails, see `TASKS.md` → Known bugs |
| type check | `npx tsc -p tsconfig.build.json --noEmit` | same check as the build |
| unit tests | `npm test` | vitest, currently fails (native binding) |
| e2e tests | `npm run test:e2e` | vitest + supertest |
| lint | `npm run lint` | oxlint, currently fails (native binding) |
| format | `npm run format` | prettier |
| seed | `npm run seed` | **TODO — the script does not exist yet** |

## 4. Working agreement

- Read `TASKS.md` → pick the first unchecked task of "Next 5 tasks".
- Implement it following `CODING_RULES.md` and `SWAGGER_RULES.md`.
- Run the build and the tests; fix what you broke.
- Update: `TASKS.md`, `API_CONTRACT.md` (status), `docs/TZ.md` (FR status), `docs/TRACEABILITY.md`, `CHANGELOG.md`.
- Never invent behaviour: if something is unclear, write "UNKNOWN - decide" and add it to `docs/OPEN_QUESTIONS.md`.

## 5. Files in this workspace

`about.md` `what.shuld.donotuse.md` `CLAUDE.md` `README.md` `TASKS.md` `PROMPTS.md` `CHANGELOG.md`
`DATABASE.md` `API_CONTRACT.md` `ARCHITECTURE.md` `CODING_RULES.md` `SWAGGER_RULES.md` `TESTING.md`
`docs/PRD.md` `docs/TZ.md` `docs/USER_STORIES.md` `docs/USE_CASES.md` `docs/NFR.md` `docs/GLOSSARY.md`
`docs/RISKS.md` `docs/DEFINITION_OF_DONE.md` `docs/ROADMAP.md` `docs/TRACEABILITY.md`
`docs/DECISIONS.md` `docs/OPEN_QUESTIONS.md`
Source: `src/main.ts` `src/app.module.ts` `src/app.controller.ts` `src/app.service.ts`
`src/common/` `src/config/database.config.ts` `src/entities/` `src/modules/` `src/swagger.document.ts`
