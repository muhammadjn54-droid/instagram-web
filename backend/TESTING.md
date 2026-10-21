# TESTING — how to build, check and test the API

| Field | Value |
|---|---|
| Version | v0.1 |
| Date | 2026-10-21 |
| Workspace | `backend/` |
| Stack | vitest (unit + e2e), supertest, oxlint, TypeScript compiler |

## 1. Commands

| What | Command | Expected result today |
|---|---|---|
| Install | `npm install` | ok |
| Rebuild the native bindings | `rm -rf node_modules package-lock.json && npm install` | fixes the lint/test failures (bug 14 in `TASKS.md`) |
| Build | `npm run build` | **FAILS** — 1 TypeScript error, see §2 |
| Type check without cache | `npx tsc -p tsconfig.build.json --noEmit --incremental false` | same 1 error |
| Lint | `npm run lint` | **FAILS** — broken native binding of oxlint |
| Unit tests | `npm test` | **FAILS** — broken native binding of rolldown |
| E2E tests | `npm run test:e2e` | **FAILS** — same reason |
| Coverage | `npm run test:cov` | same reason |
| Start the server | `npm run start:dev` | starts, but `data/app.sqlite` is not created (no TypeORM connection) |
| Swagger UI | http://localhost:3000/swagger and http://localhost:3000/api | shows the static legacy document |
| Seed | `npm run seed` | **DOES NOT EXIST** — the script must be written (task in `TASKS.md`) |

## 2. Current build error (blocker)

```text
src/config/database.config.ts:4:3 - error TS2322:
Type '"sqlite"' is not assignable to type '"aurora-mysql" | ... | "better-sqlite3" | ...'.
```

Fix: change `type: 'sqlite'` to `type: 'better-sqlite3'` in
`src/config/database.config.ts` and add
`TypeOrmModule.forRoot(databaseConfig)` to `src/app.module.ts`.

## 3. Manual Swagger flow (the E2E smoke test)

Run `npm run start:dev`, open http://localhost:3000/swagger, click
**Authorize** and paste the token from step 2. Expected status codes:

| Step | Call | Expected | Notes |
|---|---|---|---|
| 1 | `GET /` | **200** | body `Hello World!` |
| 2 | `POST /Account/register` `{userName, fullName, email, password, confirmPassword}` | **200** | `data` = "User registered successfully" |
| 2b | the same call again | **400** | "User already exists" (target: 409) |
| 3 | `POST /Account/login` `{userName, password}` | **200** | `data` = `mock-jwt-token-for-<userName>` — a mock, not a JWT |
| 4 | `Authorize` with that token | — | the token is not verified yet (no guard is registered) |
| 5 | `POST /posts` with images | **404** | the route does not exist yet (TODO) |
| 6 | `POST /posts/{postId}/likes` | **404** | TODO |
| 7 | `POST /posts/{postId}/comments` | **404** | TODO |
| 8 | `POST /follows` | **404** | TODO |
| 9 | `POST /stories` | **404** | TODO |
| 10 | `POST /chats/{chatId}/messages` | **404** | TODO |
| 11 | `DELETE /Account/ForgotPassword?Email=a@b.c` | **200** | stub, it only returns a message |

Steps 5–10 are the acceptance path of the MVP. They answer 404 until the
modules are built — that is the expected state, not a regression.

## 4. Manual checks after each task

| Check | Command | Pass rule |
|---|---|---|
| Build | `npm run build` | 0 errors |
| Types | `npx tsc -p tsconfig.build.json --noEmit --incremental false` | 0 errors |
| Lint | `npm run lint` | 0 errors (blocked by bug 14) |
| Unit tests | `npm test` | all green (blocked by bug 14) |
| E2E tests | `npm run test:e2e` | all green (blocked by bug 14) |
| Swagger | open `/swagger` | the new endpoint appears with a summary, a success schema and 5 error schemas |
| Contract | compare with `API_CONTRACT.md` | the method, the path and the status match |
| Data | open `data/app.sqlite` | the new rows are there |
| Docs | `docs/TRACEABILITY.md`, `TASKS.md`, `CHANGELOG.md` | updated |

## 5. Test strategy per layer

| Layer | What to test | Where | Minimum |
|---|---|---|---|
| Service unit | the business rules, mocked repository | `src/modules/<m>/<m>.service.spec.ts` | 1 file per service |
| Controller unit | the decorators, the status codes | `src/modules/<m>/<m>.controller.spec.ts` | 1 test per method |
| E2E | the flows of `docs/USE_CASES.md` | `test/<flow>.e2e-spec.ts` | 1 test per flow |
| Contract | the path, the method, the wrapper | `test/api-contract.e2e-spec.ts` | one test per endpoint group |

## 6. Rules for a test

1. The test name is a sentence: `it('returns 409 when the email is already taken')`.
2. Arrange → Act → Assert, with a blank line between the three blocks.
3. Use `expect(...).toBe(...)`, `toEqual`, `toHaveProperty` — no `toBeTruthy()` for a value.
4. One behaviour per test. If the name needs "and", split the test.
5. A test must not depend on another test or on the order of the tests.
6. Use a separate SQLite file for the e2e tests (`test.sqlite`), never `data/app.sqlite`.
7. Every test cleans up what it created.

## 7. Example of an e2e test (target state)

```ts
// test/account.e2e-spec.ts
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('Account (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('registers a user and logs in', async () => {
    const register = await request(app.getHttpServer())
      .post('/Account/register')
      .send({
        userName: 'tester',
        fullName: 'Test User',
        email: 'tester@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
      })
      .expect(200);
    expect(register.body.data).toBe('User registered successfully');

    const login = await request(app.getHttpServer())
      .post('/Account/login')
      .send({ userName: 'tester', password: 'Password1' })
      .expect(200);
    expect(login.body.data).toBeDefined();
  });
});
```

## 8. Performance smoke test

```bash
# 1. create 10 000 rows (script seed not ready yet — use a temporary script)
# 2. measure the list endpoint
curl -s -o /dev/null -w "%{time_total}\n" \
  -H "Authorization: Bearer <token>" \
  "http://localhost:3000/posts?pageNumber=1&pageSize=10"
```

Target: ≤ 0.100 s (NFR-021). Repeat 20 times and take the 95th percentile.

## 9. Manual regression list

| # | Action | Expected |
|---|---|---|
| 1 | `GET /` | 200, `Hello World!` |
| 2 | register with different passwords | 400, `Passwords do not match` |
| 3 | register with an existing email | 400 (target 409) |
| 4 | login with a wrong password | 400, `Invalid credentials` |
| 5 | login with an unknown user | 200 with a mock token (bug 8) |
| 6 | any protected route without a token | 401 once the guard is registered |
| 7 | upload a 12 MB file | 413 once the upload limit is in place |
| 8 | upload a `.exe` file | 400 once the mime whitelist is in place |
| 9 | `POST /posts` without images | 400 once the DTO validator exists |
| 10 | delete another user's post | 403 once the owner check exists |
