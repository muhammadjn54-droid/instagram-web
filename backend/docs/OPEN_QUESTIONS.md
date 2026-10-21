# OPEN QUESTIONS — unknown, to decide

| Field | Value |
|---|---|
| Version | v0.1 |
| Date | 2026-10-21 |
| Rule | write "UNKNOWN - decide" in the documents and add the question here. Never invent an answer. |

| ID | Question | Why it matters | Default used in the docs | Blocks |
|---|---|---|---|---|
| Q-01 | How is the Admin role stored? Add a `role` column to `users`, a separate `admins` table, or a config list of user ids? | the admin routes (delete any post / story / user, write locations) cannot be protected without it | no role exists; the admin routes are TODO and marked "Bearer (admin)" | the admin endpoints |
| Q-02 | What is the lifetime of the access token and of the refresh token? | `users.refreshToken` exists but no endpoint uses it | access 15 min, refresh 7 days (NFR-005) | the auth module |
| Q-03 | Do the register and login routes move to REST paths (`/accounts`, `/auth/login`) or stay at `/Account/register` and `/Account/login`? | the frontend may already call the legacy paths | they stay (D-02) | the frontend integration |
| Q-04 | Should register and login answer 200 or 201? | `API_CONTRACT.md` documents the current 200 | 200 (the current behaviour) | the account module |
| Q-05 | Where are the uploaded files stored: the local `uploads/` folder or an object storage (S3)? What is the real size limit? | NFR-029 and NFR-030 fix 10 MB and the local folder | local `uploads/`, 10 MB | the upload endpoints |
| Q-06 | What must the login answer when the userName does not exist: 401 or 404? | today the answer is 200 with a mock token (bug 8) | 401 `Invalid credentials` for both cases (no user enumeration) | the account module |
| Q-07 | Is the API versioned with a `/api/v1` prefix? | NFR-043 proposes it, but `main.ts` has no prefix and the legacy paths have none | no prefix today, the prefix is planned for v1.0 | the release plan |
| Q-08 | Is Nest Observe kept with the placeholder keys `YOUR_APP_KEY` / `YOUR_APP_SECRET`, or removed? | the telemetry is not connected (bug 17) | it stays as it is, the keys are a TODO | the observability |
| Q-09 | Is a maximum page size of 100 acceptable? | NFR-025 and every list endpoint use it | yes, 100 | nothing |
| Q-10 | Do private accounts need a follow request with an approval step in the MVP? | `profiles.isPrivate` exists, but the follow entity has no status column | no, the MVP has a direct follow | the follows module |
| Q-11 | Is the refresh token flow part of the MVP? | the column exists, the endpoints do not | no, it is a v1.5 item | nothing |
| Q-12 | What must the seed script create, and how many rows? | `npm run seed` does not exist | a script with 20 users, 60 posts, 20 stories, 10 chats and 10 locations (v1.5) | the manual demo |
| Q-13 | Is the unique constraint on the chat pair added to the entity, or checked in the service? | `chats` has no unique constraint on (`user1Id`, `user2Id`) | the check is in the service, the constraint is a TODO | the chats module |
| Q-14 | Are the text limits right: post caption 2200, title 300, comment 500, message 2000, bio 150, website 200? | the reference spec only says `minLength: 1` | the values above, all written as numbers in the documents | the DTOs |
| Q-15 | Should the documentation live in the monorepo root instead of `backend/`? | the workspace has a `frontend/` folder with its own `AGENTS.md` | it stays in `backend/` (D-01) | nothing |
| Q-16 | Is `GET /users/{userId}` allowed to show the email of another user? | the email is a personal field | the list shows `userName` and `fullName` only, the email is only for the owner and the admin | the users module |

## Answers to give

Reply with the number and the answer, for example: `Q-02: access 30 min, refresh 30 days`.
The answer is then written in `docs/DECISIONS.md` with a new `D-xx` row and the
affected documents are updated.
