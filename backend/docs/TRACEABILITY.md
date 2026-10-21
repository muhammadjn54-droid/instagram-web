# TRACEABILITY — FR → US → endpoint → status

| Field | Value |
|---|---|
| Version | v0.1 |
| Date | 2026-10-21 |
| Sources | `docs/TZ.md` §5 (FR), `docs/USER_STORIES.md` (US), `API_CONTRACT.md` (endpoint) |

Status is the status of the **endpoint**, and it must be identical in the three
source files. `PARTIAL` means the endpoint exists but is a stub or a mock.
Every FR must have at least one US and one endpoint, or be marked TODO.

| FR | Requirement | US | Endpoint | Status |
|---|---|---|---|---|
| FR-001 | Register an account | US-001 | `POST /Account/register` | PARTIAL |
| FR-002 | Log in and get a JWT | US-002 | `POST /Account/login` | PARTIAL |
| FR-003 | Request a password reset | US-003 | `DELETE /Account/ForgotPassword` | PARTIAL |
| FR-004 | Reset the password with a token | US-004 | `DELETE /Account/ResetPassword` | PARTIAL |
| FR-005 | Change the password | US-005 | `PUT /Account/ChangePassword` | PARTIAL |
| FR-006 | Reject a duplicate userName / email | US-001 | `POST /Account/register` | DONE |
| FR-007 | Hash the password with bcrypt | US-001, US-002 | `POST /Account/register` | TODO |
| FR-010 | Search the users | US-010 | `GET /users` | TODO |
| FR-011 | Read one user | US-011, US-015 | `GET /users/{userId}`, `GET /users/me` | TODO |
| FR-012 | Delete the account | US-012, US-013 | `DELETE /users/{userId}` | TODO |
| FR-013 | Save a text search | US-100 | `POST /search-histories` | TODO |
| FR-014 | Save a user search | US-101 | `POST /search-histories/user-searches` | TODO |
| FR-015 | Read and clear the search history | US-102, US-103, US-104 | `GET /search-histories`, `DELETE /search-histories/{id}`, `DELETE /search-histories` | TODO |
| FR-020 | Read the own profile | US-020 | `GET /profiles/me` | TODO |
| FR-021 | Read a profile by userId | US-021 | `GET /profiles/{userId}` | TODO |
| FR-022 | Update the profile | US-022 | `PUT /profiles/{userId}` | TODO |
| FR-023 | Upload and delete the avatar | US-023 | `PUT /profiles/{userId}/avatar`, `DELETE /profiles/{userId}/avatar` | TODO |
| FR-024 | Read the follow state | US-024 | `GET /profiles/{userId}/follow-state` | TODO |
| FR-030 | Follow a user | US-030 | `POST /follows` | TODO |
| FR-031 | Unfollow a user | US-031 | `DELETE /follows/{followingUserId}` | TODO |
| FR-032 | List the followers | US-032 | `GET /users/{userId}/followers` | TODO |
| FR-033 | List the following | US-033 | `GET /users/{userId}/following` | TODO |
| FR-040 | Create a post | US-040 | `POST /posts` | TODO |
| FR-041 | Read one post | US-041 | `GET /posts/{postId}` | TODO |
| FR-042 | List the posts | US-042 | `GET /posts` | TODO |
| FR-043 | List the own posts | US-042 | `GET /users/me/posts` | TODO |
| FR-044 | Delete the own post | US-044 | `DELETE /posts/{postId}` | TODO |
| FR-045 | Like and unlike a post | US-043 | `POST /posts/{postId}/likes`, `DELETE /posts/{postId}/likes` | TODO |
| FR-046 | Register a post view | US-041 | `POST /posts/{postId}/views` | TODO |
| FR-047 | List the reels | US-042 | `GET /reels` | TODO |
| FR-048 | Feed of the followed accounts | US-034 | `GET /posts/feed` | TODO |
| FR-050 | Add a comment | US-050, US-053, US-054 | `POST /posts/{postId}/comments` | TODO |
| FR-051 | List the comments | US-051 | `GET /posts/{postId}/comments` | TODO |
| FR-052 | Delete the own comment | US-052 | `DELETE /comments/{commentId}` | TODO |
| FR-060 | Save a favorite | US-060, US-064 | `POST /favorites` | TODO |
| FR-061 | Remove a favorite | US-061 | `DELETE /favorites/{postId}` | TODO |
| FR-062 | List the favorites | US-062, US-063 | `GET /users/me/favorites` | TODO |
| FR-070 | Upload a story | US-070 | `POST /stories` | TODO |
| FR-071 | Expire a story after 24 h | US-073 | `GET /stories` | TODO |
| FR-072 | Stories of the followed accounts | US-071 | `GET /stories` | TODO |
| FR-073 | Stories of one user | US-072 | `GET /users/{userId}/stories` | TODO |
| FR-074 | Own stories | US-070 | `GET /users/me/stories` | TODO |
| FR-075 | Read, like and view a story | US-071 | `GET /stories/{storyId}`, `POST /stories/{storyId}/likes`, `POST /stories/{storyId}/views` | TODO |
| FR-076 | Delete the own story | US-074 | `DELETE /stories/{storyId}` | TODO |
| FR-080 | List the chats | US-081 | `GET /chats` | TODO |
| FR-081 | Read one chat | US-081 | `GET /chats/{chatId}` | TODO |
| FR-082 | Create a chat | US-080 | `POST /chats` | TODO |
| FR-083 | Send a text message | US-082 | `POST /chats/{chatId}/messages` | TODO |
| FR-084 | Send a message with a file | US-083 | `POST /chats/{chatId}/messages` | TODO |
| FR-085 | Delete a message and a chat | US-084 | `DELETE /chats/{chatId}/messages/{messageId}`, `DELETE /chats/{chatId}` | TODO |
| FR-090 | List the locations | US-090 | `GET /locations` | TODO |
| FR-091 | Read one location | US-091 | `GET /locations/{locationId}` | TODO |
| FR-092 | Create a location | US-092 | `POST /locations` | TODO |
| FR-093 | Update a location | US-093 | `PUT /locations/{locationId}` | TODO |
| FR-094 | Delete a location | US-094 | `DELETE /locations/{locationId}` | TODO |
| FR-100 | Health check | — | `GET /` | DONE |
| FR-101 | One response wrapper | — | every endpoint | PARTIAL |
| FR-102 | Global JWT guard | US-020 | every protected endpoint | PARTIAL |
| FR-103 | Public routes without a token | US-001, US-002 | `POST /Account/register`, `POST /Account/login` | PARTIAL |
| FR-104 | Swagger UI | — | `GET /swagger`, `GET /api` | DONE |
| FR-105 | Global exception filter | — | every endpoint | PARTIAL |
| FR-106 | Pagination | US-042, US-090, US-102 | `GET /posts`, `GET /locations`, `GET /search-histories` | TODO |

## Coverage summary

| Check | Result |
|---|---|
| FR in `docs/TZ.md` | 62 |
| FR with at least one US | 58 — FR-100, FR-101, FR-104 and FR-105 are platform features without a story |
| FR with at least one endpoint | 62 of 62 |
| FR in the TODO state | 50 (3 DONE: FR-006, FR-100, FR-104 — 9 PARTIAL: FR-001…FR-005, FR-101, FR-102, FR-103, FR-105) |
| Endpoints of `API_CONTRACT.md` | 63 (1 DONE, 5 PARTIAL, 57 TODO) |
| Endpoints that exist in the code | 6 of 63 (1 DONE + 5 PARTIAL) |
| FR without a US and not a platform FR | 0 |
