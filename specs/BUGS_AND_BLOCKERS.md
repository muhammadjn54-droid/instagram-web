# Known Bugs, Limitations, and Blockers — Instagram Web Clone

> **Document Version:** 2.0 (2026-10-23)
> **Status:** live tracking document. The full list of fixed defects with their causes is in the root [`tz.md`](../tz.md) §3.

---

## 1. Environment limitations

| ID | Component | Description | Workaround / Resolution | Status |
| :--- | :--- | :--- | :--- | :---: |
| **ENV-01** | Playwright | The driver download failed on `azureedge.net` in the first environment. | Endpoints were verified with HTTP calls (curl / Node `fetch`) through the real Next.js proxy. A browser pass is still open (tz.md §6.1). | **OPEN** |
| **ENV-02** | TypeORM ESM circular reference | Entities referencing each other caused `ReferenceError` at start-up. | `Relation<T>` wrapper on every relation property. | **RESOLVED** |
| **ENV-03** | Dependencies after `git pull` | New packages (for example `@reduxjs/toolkit`) are not installed by a pull. | Run `npm install` in `frontend/` and `backend/` after every pull. | **PROCESS** |
| **ENV-04** | Local database | `backend/data/app.sqlite` is git-ignored, so each machine has its own data. `npm run seed` **deletes all rows** before inserting demo data. | Run the seed only on a throw-away database. | **PROCESS** |
| **ENV-07** | Demo media | Seeded photos/videos are remote URLs (Unsplash, Wikimedia, Mixkit); they need internet access. `backend/uploads/*.jpg` are 134-byte placeholders. | Optional: download the files into `backend/uploads` and store local paths. | **INFO** |
| **ENV-05** | Windows line endings | Many source files use CRLF. Editing tools must preserve them. | — | **INFO** |
| **ENV-06** | Next.js dev lock | Only one `next dev` per project folder. | Stop the running dev server before starting another. | **INFO** |

## 2. Active functional gaps

| ID | Description | Resolution plan |
| :--- | :--- | :--- |
| **GAP-1** | Story owner cannot delete a story / see viewers in the UI (endpoints work). | Wire UI after design. |
| **GAP-2** | No edit-post UI (`PATCH /posts/:id` works). | Wire UI after design. |
| **GAP-3** | No delete-account UI (`DELETE /users/me` works). | Needs a confirmation flow. |
| **GAP-4** | No delete message / conversation UI; inbox cannot start a new chat (only from a profile). | Wire UI after design. |
| **GAP-5** | Mobile bottom bar has no logout / reels / saved / stories; the bell icon is decorative. | UI phase. |
| **GAP-6** | Private accounts are hidden in the UI only; the backend returns their posts. | Add a follower check in `PostsService` for `findAll(userId)` and `findOne`. |
| **GAP-7** | User search matches e-mail substrings (e-mail probing). | Remove e-mail from `UsersService.findAll` search. |
| **GAP-8** | No mail provider: outside production the reset token is returned by the API. | Integrate a mail provider before production. |
| **BLOCKER-02** | No WebSocket server, so chat uses polling (thread 4 s, list 8 s). | Acceptable for now; WebSocket is deferred. |

| **GAP-11** | Two dynamic Russian texts are not translated: `Поле «x» обязательно` (register proxy) and `Ошибка запроса (N)` (`axios.ts`). Numbers keep the Russian grouping in English. | Add keys with placeholders if it ever matters. |

## 3. Resolved blockers

| ID | Description | Resolution |
| :--- | :--- | :--- |
| **BLOCKER-01** | Application shell missing for subroutes. | Done: `(app)/layout.tsx` → `AppShell` (`Sidebar`, `TopBar`, `MobileNav`, `SessionGuard`); `proxy.ts` guards routes. |
| **SEC-01…04** | Password-reset takeover, leaked password hash in favorites, guessable refresh token, public e-mail exposure. | Fixed 2026-10-23, see `tz.md` §3 and `SECURITY.md` §4. |
| **BUG-B1 / B2** | Public routes ignored the token; `isReel=false` read as true. | Fixed 2026-10-23. |
| **BUG-F1…F16** | Frontend defects (own profile showed all posts, dead tiles, chat order, 401 loop, cache tags, …). | Fixed 2026-10-23, see `tz.md` §3. |
