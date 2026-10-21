# USE CASES — Instagram-like Social Network API

| Field | Value |
|---|---|
| Version | v0.1 |
| Date | 2026-10-21 |
| Format | Actor / Preconditions / Main steps / Alternative steps / Errors / Result |

Endpoint names come from `API_CONTRACT.md`. `/Account/*` routes are LEGACY
(existing in `src/modules/account/account.controller.ts`); all other names are
the target REST contract and are still TODO in code.

---

## UC-001 Register

| Part | Content |
|---|---|
| Actor | Guest (P-A) |
| Preconditions | Email and userName are not used yet; the client has the form data |
| Main steps | 1. Client sends `POST /Account/register` (LEGACY) with `{userName, fullName, email, password, confirmPassword}` → 200. 2. Server checks `password === confirmPassword` → else 400. 3. Server checks userName and email are free → else 400. 4. Server stores the user and answers `{statusCode:200, data:"User registered successfully", errors:null}` |
| Alternative steps | 1a. Server answers 409 when the email is taken (after FR-006 is DONE). 1b. Server hashes the password with bcrypt (after FR-007 is DONE) |
| Errors | 400 `Passwords do not match`; 400 `User already exists`; 400 validation error (after DTO validators exist) |
| Result | A new account exists. Today it lives only in the in-memory array of `AccountService` and is lost on restart (bug, `TASKS.md`) |

## UC-002 Login

| Part | Content |
|---|---|
| Actor | Guest / registered User (P-A, P-B) |
| Preconditions | The user is registered |
| Main steps | 1. Client sends `POST /Account/login` (LEGACY) with `{userName, password}` → 200. 2. Server finds the user by userName. 3. Server compares the password. 4. Server signs a JWT and returns it in `data` |
| Alternative steps | 2a. User not found → 404 or 401 (decide, Q-06). 4a. Today the server returns the literal string `mock-jwt-token-for-<userName>` instead of a signed token |
| Errors | 400 `Invalid credentials` (wrong password); 400 validation error; 401 missing token (later endpoints) |
| Result | The client stores the token and sends it as `Authorization: Bearer <token>` |

## UC-003 Reset password

| Part | Content |
|---|---|
| Actor | Guest / User (P-A, P-B) |
| Preconditions | The user knows the email used at registration |
| Main steps | 1. Client sends the forgot-password request with the email. 2. Server creates a one-time reset token with expiry 60 min. 3. Server sends the token by email. 4. Client sends the reset request with `{token, password, confirmPassword}` → 200. 5. Server checks the token and the expiry. 6. Server stores the new password hash and invalidates the token |
| Alternative steps | 4a. Token expired → 400 `Reset token expired`. 4b. Email unknown → the server still answers 200 so the email is not leaked |
| Errors | 400 `Reset token expired`; 400 `Invalid reset token`; 400 `Passwords do not match` |
| Result | The old password stops working. Today both steps are stubs that only return a message (FR-003, FR-004 = PARTIAL) |

## UC-004 Create post

| Part | Content |
|---|---|
| Actor | User (P-B) |
| Preconditions | Valid token; 1–10 images in jpg/png, each ≤ 10 MB; optional title ≤ 300 chars, content ≤ 2200 chars, optional locationId |
| Main steps | 1. Client sends `POST /posts` as `multipart/form-data`. 2. Server validates the token. 3. Server validates the DTO fields. 4. Server saves the files under `uploads/` and stores their urls. 5. Server inserts the `posts` row and 1–10 `post_images` rows. 6. Server answers 201 with the post id |
| Alternative steps | 3a. Zero images → 400 `At least one image is required`. 3b. Image above 10 MB → 413. 3c. Content above 2200 chars → 400. 5a. `isReel = true` when a single video file is sent |
| Errors | 401 no token; 400 validation error; 413 file too large; 404 location not found |
| Result | The post appears in `GET /users/{userId}` posts and in the feed of followers |

## UC-005 Like and comment

| Part | Content |
|---|---|
| Actor | User (P-B) |
| Preconditions | Valid token; an existing post |
| Main steps | 1. Client sends `POST /posts/{postId}/likes` → 200, like counter +1. 2. Client sends `POST /posts/{postId}/comments` with `{content}` → 201. 3. Server checks `post_likes` unique (postId, userId). 4. Server inserts the comment with the author id from the JWT |
| Alternative steps | 1a. Already liked → 409 `Already liked`. 2a. Empty comment → 400. 2b. Comment longer than 500 chars → 400. 3a. Post deleted → 404 `Post not found` |
| Errors | 401 no token; 403 post belongs to a private account (not followed); 404 post not found; 409 already liked |
| Result | The author sees the like and the comment in the post counters |

## UC-006 Follow

| Part | Content |
|---|---|
| Actor | User (P-B) |
| Preconditions | Valid token; the target userId exists and is not me |
| Main steps | 1. Client sends `POST /follows` with `{followingUserId}` → 200. 2. Server checks `followerId !== followingUserId` → else 400. 3. Server checks the unique pair (followerId, followingId) → else 409. 4. Server inserts the `follows` row |
| Alternative steps | 2a. Target user does not exist → 404. 2b. Target account is private and does not accept the request → 403 |
| Errors | 400 `Cannot follow yourself`; 401 no token; 404 user not found; 409 already following |
| Result | The new posts of that account appear in `GET /posts/feed` and the counters of both profiles grow |

## UC-007 Add story

| Part | Content |
|---|---|
| Actor | User (P-B) |
| Preconditions | Valid token; one image in jpg/png ≤ 10 MB |
| Main steps | 1. Client sends `POST /stories` as multipart → 201. 2. Server stores the file. 3. Server inserts the `stories` row with `expiresAt = createdAt + 24 h`. 4. Server answers with the story id and `expiresAt` |
| Alternative steps | 2a. Wrong mime type → 400. 2b. File above 10 MB → 413. 3a. A story may reference an existing post via `postId` |
| Errors | 401 no token; 400 no file; 413 file too large; 404 post not found (when `postId` is given) |
| Result | The story is listed in `GET /stories` for followers until `expiresAt` |

## UC-008 View story

| Part | Content |
|---|---|
| Actor | User (P-B) |
| Preconditions | Valid token; the story is not expired |
| Main steps | 1. Client sends `GET /stories` → 200 with the stories of followed users. 2. Client sends `GET /users/{userId}/stories` → 200. 3. Client sends `POST /stories/{storyId}/views` → 200. 4. Server inserts a `story_views` row (unique per story and user) |
| Alternative steps | 1a. No stories → 200 with an empty `items` array. 3a. Already viewed → 200 without creating a second row. 3b. Story expired → 404 `Story not found or expired` |
| Errors | 401 no token; 404 story not found or expired |
| Result | The owner sees the viewer in the story viewer list |

## UC-009 Chat

| Part | Content |
|---|---|
| Actor | User (P-B) |
| Preconditions | Valid token; the other user exists |
| Main steps | 1. Client sends `POST /chats` with `{receiverUserId}` → 200 with the chat id. 2. Server creates the chat with `user1Id` = smaller id. 3. Client sends `PUT /chats/{chatId}/messages` with `{text}` → 200. 4. Server inserts the `messages` row with `senderId` from the JWT. 5. Client reads `GET /chats` → 200 |
| Alternative steps | 1a. Chat with myself → 400. 1b. Chat already exists → 409 and the existing chat id is returned. 3a. A file is attached → multipart, `fileUrl` is stored |
| Errors | 400 `Cannot chat with yourself`; 401 no token; 403 not a member of the chat; 404 user or chat not found; 409 chat already exists |
| Result | The message is stored and listed inside the chat |

## UC-010 Search

| Part | Content |
|---|---|
| Actor | User (P-B) |
| Preconditions | Valid token |
| Main steps | 1. Client sends `GET /users?userName=&email=&pageNumber=1&pageSize=10` → 200 with `data.items`. 2. Client sends `GET /locations?city=` → 200. 3. Client stores the query: `POST /search-histories` with `{text}` → 200. 4. Client reads `GET /search-histories` → 200, newest first |
| Alternative steps | 1a. No match → 200 with `totalCount = 0` and an empty `items` array. 3a. A user-targeted search stores `searchedUserId` instead of `text`. 4a. The user clears everything with `DELETE /search-histories` → 200 |
| Errors | 400 pageSize above 100; 401 no token; 404 user not found (user-targeted search) |
| Result | Matching users are found and the query is remembered in `search_history` |
