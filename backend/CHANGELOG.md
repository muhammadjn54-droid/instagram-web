# CHANGELOG

All notable changes of the Instagram-like Social Network API.
Format: [semantic versioning](https://semver.org). Dates: `YYYY-MM-DD`.

## [0.1.0] — 2026-10-21

First version of the documentation system. **No source code was changed.**

### Added — documentation

| File | Content |
|---|---|
| `about.md` | goal, real stack, 15 global rules, the route policy, the module list, the folder pattern |
| `README.md` | entry point of the repository: how to start it and where to read |
| `what.shuld.donotuse.md` | the original rules merged with the new ones; the "do not change routes" rule is replaced by the route policy |
| `docs/PRD.md` | vision, 3 personas, 6 problems, 22 features (MoSCoW), 8 success metrics, the MVP definition |
| `docs/TZ.md` | 13 sections: 62 functional requirements (FR-001…FR-106), NFR summary, business rules, acceptance criteria, risks, open questions |
| `docs/USER_STORIES.md` | 55 user stories in 11 modules with Given / When / Then and the errors |
| `docs/USE_CASES.md` | 10 flows: register, login, reset password, create post, like + comment, follow, add story, view story, chat, search |
| `docs/NFR.md` | 58 non-functional requirements with numbers (security, performance, storage, logging, versioning, quality gates) |
| `docs/GLOSSARY.md` | 25 terms of the domain |
| `docs/RISKS.md` | 17 risks with probability, impact, prevention and contingency, plus the assumptions and the constraints |
| `DATABASE.md` | the 16 entities with their fields, types, nullability, relations, unique constraints, delete rules and a mermaid ER diagram |
| `API_CONTRACT.md` | 63 endpoints: method, path, auth, request, success, errors, status (1 DONE, 5 PARTIAL, 57 TODO) |
| `ARCHITECTURE.md` | the real `src/` tree, the request flow, where the guards / pipes / filters / interceptors live, the "add a module" recipe |
| `CODING_RULES.md` | 14 rules, each with one GOOD and one BAD example |
| `SWAGGER_RULES.md` | the template of a perfect controller method (plain, multipart and public), the helper table, a 16-point checklist |
| `CLAUDE.md` | reading order, the 10 most important rules, the commands, the file list |
| `TASKS.md` | the checklists of the 12 modules, "Next 5 tasks", 18 known bugs |
| `TESTING.md` | the commands, the current build error, the manual Swagger flow with the expected status codes, the test strategy |
| `PROMPTS.md` | 10 reusable prompts: add a module, fix a bug, add an endpoint, safe refactor, write tests, review, Swagger only, continue, update docs, release check |
| `docs/DEFINITION_OF_DONE.md` | the 8 checklist groups of a finished task |
| `docs/ROADMAP.md` | v0.1, v1.0, v1.5, v2.0 with the order of work |
| `docs/TRACEABILITY.md` | FR → US → endpoint → status for the 62 functional requirements |
| `docs/DECISIONS.md` | the decisions taken while writing the documentation |
| `docs/OPEN_QUESTIONS.md` | the 12 questions that need an answer |

### Changed

| File | Change |
|---|---|
| `backend/about.md` | rewritten: the real stack, the route policy, the module status, the link to the other documents |
| `backend/what.shuld.donotuse.md` | the "do not change routes" rule is removed; the route policy, the docs-only rule and the "update TASKS.md" rule are added |

### Known issues at this version (not fixed here — see `TASKS.md` → Known bugs)

1. `npm run build` fails: `type: 'sqlite'` is not a valid TypeORM 1.x driver.
2. The database is never connected; the users live in an array in `AccountService`.
3. The guard, the pipe, the filter and the interceptor are written but not registered.
4. The passwords are stored and compared in plain text.
5. `login` returns a mock token, also for an unknown user.
6. The DTOs have no validator.
7. The Swagger UI serves the static legacy `.NET` document.
8. `npm test` and `npm run lint` fail because of a broken native binding.
