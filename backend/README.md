# Instagram-like Social Network API

NestJS 12 + TypeORM + SQLite backend of an Instagram-like app: accounts,
profiles, follows, posts, likes, comments, favorites, stories, chats,
locations and search history.

| Field | Value |
|---|---|
| Workspace | `backend/` (this folder). The web client is `../frontend/` (Next.js). |
| Runtime | Node.js, NestJS 12, ESM (`"type": "module"`) |
| Database | SQLite via TypeORM (`better-sqlite3`), file `data/app.sqlite` |
| API docs | http://localhost:3000/swagger and http://localhost:3000/api |
| Start | `npm run start:dev` → http://localhost:3000 |
| Status | v0.1 — the documentation set is complete, the feature modules are not built yet |

## Start

```bash
npm install
npm run start:dev
```

The build currently fails on one TypeScript error (`src/config/database.config.ts`
uses the driver `sqlite` instead of `better-sqlite3`) — see `TASKS.md` → Known bugs.

## Read the documentation

Start with `CLAUDE.md`: it gives the reading order, the 10 most important rules
and the commands.

| Need | File |
|---|---|
| Reading order + rules | `CLAUDE.md` |
| Goal, stack, route policy | `about.md` |
| Banned practices | `what.shuld.donotuse.md` |
| Requirements (62 FR) | `docs/TZ.md` |
| API contract (63 endpoints) | `API_CONTRACT.md` |
| Database (16 entities) | `DATABASE.md` |
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

## Commands

| What | Command |
|---|---|
| dev server | `npm run start:dev` |
| build | `npm run build` |
| type check | `npx tsc -p tsconfig.build.json --noEmit --incremental false` |
| lint | `npm run lint` |
| unit tests | `npm test` |
| e2e tests | `npm run test:e2e` |
| format | `npm run format` |
| seed | `npm run seed` — **TODO, the script does not exist yet** |

## Legacy files

`src/swagger.old.json`, `src/swagger.json`, `src/swagger.document.ts` and
`src/abaut.md` are the **old .NET specification** (57 routes). They are a
feature checklist, not a URL contract. The real contract is `API_CONTRACT.md`.
Do not delete them and do not edit them by hand.
