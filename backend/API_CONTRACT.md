# API CONTRACT — Instagram-like Social Network API

| Field | Value |
|---|---|
| Version | v0.1 |
| Date | 2026-10-21 |
| Base URL | `http://localhost:3000` (dev) |
| Swagger UI | `/swagger` and `/api` — static document today, see RISK-005 |
| Wrapper | every response is `{statusCode, data, errors}` (`src/common/responses/api-response.ts`) |
| Auth | `Authorization: Bearer <JWT>` for every route except the public ones |

**Status legend**

| Status | Meaning |
|---|---|
| **DONE** | the endpoint exists in `src/` and answers as described |
| **PARTIAL** | the endpoint exists but returns a stub, a mock or a hard-coded value |
| **TODO** | the endpoint does not exist in `src/` yet |

**Route policy.** New routes are REST style: plural nouns, kebab-case, ids in the
path. The 5 legacy `/Account/*` routes already exist and keep their names.
`src/swagger.old.json` is a **feature reference**, not a URL contract — the column
`Ref` shows which reference endpoint each new route replaces.

**Error codes used in this document**

| Code | Meaning | Typical case |
|---|---|---|
| 400 | validation or business rule | password mismatch, self-follow, pageSize > 100 |
| 401 | no token, expired token, wrong credentials | missing `Authorization` header |
| 403 | the caller has no rights | not the owner, private profile, wrong role |
| 404 | the resource does not exist | unknown postId, expired story |
| 409 | the resource already exists | duplicate email, already liked |
| 413 | the uploaded file is too large | file above 10 MB |
| 429 | too many requests | more than 10 logins per minute per IP |

---

## 1. Platform

| Method | Path | Auth | Request | Success | Errors | Status |
|---|---|---|---|---|---|---|
| GET | `/` | none | none | 200 `text` = `"Hello World!"` | — | **DONE** |

Source: `src/app.controller.ts` → `src/app.service.ts`.

## 2. Account — `src/modules/account/account.controller.ts`

All 5 routes are **legacy**: they keep their original names and use the old
verb-style paths. They are not renamed by this documentation work.

### 2.1 POST `/Account/register` — PARTIAL

| Part | Content |
|---|---|
| Auth | none (public) |
| Request | body `RegisterDto` = `{userName: string, fullName: string, email: string, password: string, confirmPassword: string}` |
| Success | 200 `{statusCode:200, data:"User registered successfully", errors:null}` |
| Errors | 400 `Passwords do not match`; 400 `User already exists` |
| Notes | The user is stored in an array in `AccountService`, the password is plain text (FR-007). No class-validator on the DTO yet (FR-001 = PARTIAL). |

### 2.2 POST `/Account/login` — PARTIAL

| Part | Content |
|---|---|
| Auth | none (public) |
| Request | body `LoginDto` = `{userName: string, password: string}` |
| Success | 200 `{statusCode:200, data:"mock-jwt-token-for-<userName>", errors:null}` |
| Errors | 400 `Invalid credentials` (wrong password) |
| Notes | No real JWT is signed (FR-002). An unknown userName also returns 200 with a mock token — a bug, see `TASKS.md` → Known bugs. |

### 2.3 DELETE `/Account/ForgotPassword` — PARTIAL

| Part | Content |
|---|---|
| Auth | none (public) |
| Request | query `Email` (string, required) |
| Success | 200 `{statusCode:200, data:"Password reset instructions sent to <email>", errors:null}` |
| Errors | 400 missing email |
| Notes | Stub. The reference spec asks for `Email` only; the reset token is not created yet (FR-003). |

### 2.4 DELETE `/Account/ResetPassword` — PARTIAL

| Part | Content |
|---|---|
| Auth | none (public) |
| Request | query `Email` (string, optional in the code) |
| Success | 200 `{statusCode:200, data:"Password has been reset successfully for <email>", errors:null}` |
| Errors | 400 missing or invalid token |
| Notes | Stub, the password is not changed (FR-004). The reference spec expects `Token`, `Email`, `Password`, `ConfirmPassword` in the query — those must move into the body (about.md rule 6). |

### 2.5 PUT `/Account/ChangePassword` — PARTIAL

| Part | Content |
|---|---|
| Auth | should be Bearer JWT (not enforced today) |
| Request | none in the code; the reference spec expects `OldPassword`, `Password`, `ConfirmPassword` in the query — they must move into the body |
| Success | 200 `{statusCode:200, data:"Password changed successfully", errors:null}` |
| Errors | 401 no token; 400 old password wrong |
| Notes | Stub (FR-005). |

## 3. Users — module folder `src/modules/users/` (empty)

| Method | Path | Auth | Request | Success | Errors | Ref | Status |
|---|---|---|---|---|---|---|---|
| GET | `/users` | Bearer | query `userName?`, `email?`, `pageNumber≥1`, `pageSize 1…100` | 200 `data` = `PagedResult<UserSummaryDto>` | 400 bad page size | `GET /User/get-users` | TODO |
| GET | `/users/me` | Bearer | none | 200 `data` = `UserDto` | 401 | new | TODO |
| GET | `/users/{userId}` | Bearer | path `userId` (int) | 200 `data` = `UserDto` | 404 | new | TODO |
| DELETE | `/users/{userId}` | Bearer | path `userId` (int) | 200 `data` = `null` | 401, 403, 404 | `DELETE /User/delete-user` | TODO |

## 4. Search history — module folder `src/modules/search-history/` (empty)

| Method | Path | Auth | Request | Success | Errors | Ref | Status |
|---|---|---|---|---|---|---|---|
| POST | `/search-histories` | Bearer | body `{text: string 1…100}` | 200 `data` = `SearchHistoryDto` | 400, 401 | `POST /User/add-search-history` | TODO |
| GET | `/search-histories` | Bearer | query `pageNumber`, `pageSize` | 200 `data` = `PagedResult<SearchHistoryDto>`, newest first | 401 | `GET /User/get-search-histories` | TODO |
| DELETE | `/search-histories/{id}` | Bearer | path `id` (int) | 200 `data` = `null` | 401, 404 | `DELETE /User/delete-search-history` | TODO |
| DELETE | `/search-histories` | Bearer | none | 200 `data` = `{deleted: number}` | 401 | `DELETE /User/delete-search-histories` | TODO |
| POST | `/search-histories/user-searches` | Bearer | body `{searchedUserId: int}` | 200 `data` = `SearchHistoryDto` | 401, 404 | `POST /User/add-user-search-history` | TODO |
| GET | `/search-histories/user-searches` | Bearer | query `pageNumber`, `pageSize` | 200 `data` = `PagedResult<SearchHistoryDto>` | 401 | `GET /User/get-user-search-histories` | TODO |
| DELETE | `/search-histories/user-searches/{id}` | Bearer | path `id` (int) | 200 `data` = `null` | 401, 404 | `DELETE /User/delete-user-search-history` | TODO |
| DELETE | `/search-histories/user-searches` | Bearer | none | 200 `data` = `{deleted: number}` | 401 | `DELETE /User/delete-user-search-histories` | TODO |

## 5. Profiles — module folder `src/modules/profiles/` (empty)

| Method | Path | Auth | Request | Success | Errors | Ref | Status |
|---|---|---|---|---|---|---|---|
| GET | `/profiles/me` | Bearer | none | 200 `data` = `ProfileDto` | 401 | `GET /UserProfile/get-my-profile` | TODO |
| GET | `/profiles/{userId}` | Bearer | path `userId` (int) | 200 `data` = `ProfileDto` + counters | 403 private, 404 | `GET /UserProfile/get-user-profile-by-id` | TODO |
| PUT | `/profiles/{userId}` | Bearer | body `{bio≤150, avatar?, website≤200, gender 0\|1, isPrivate}` | 200 `data` = `ProfileDto` | 400, 401, 403 | `PUT /UserProfile/update-user-profile` | TODO |
| GET | `/profiles/{userId}/follow-state` | Bearer | path `userId` (int) | 200 `data` = `{isFollowing: boolean}` | 401, 404 | `GET /UserProfile/get-is-follow-user-profile-by-id` | TODO |
| PUT | `/profiles/{userId}/avatar` | Bearer | multipart `image` (jpg/png/webp, ≤10 MB) | 200 `data` = `ProfileDto` | 400, 401, 403, 413 | `PUT /UserProfile/update-user-image-profile` | TODO |
| DELETE | `/profiles/{userId}/avatar` | Bearer | path `userId` (int) | 200 `data` = `ProfileDto` | 401, 403 | `DELETE /UserProfile/delete-user-image-profile` | TODO |

## 6. Follows — module folder `src/modules/follows/` (empty)

| Method | Path | Auth | Request | Success | Errors | Ref | Status |
|---|---|---|---|---|---|---|---|
| POST | `/follows` | Bearer | body `{followingUserId: int}` | 200 `data` = `FollowDto` | 400 self, 401, 404, 409 | `POST /FollowingRelationShip/add-following-relation-ship` | TODO |
| DELETE | `/follows/{followingUserId}` | Bearer | path `followingUserId` (int) | 200 `data` = `null` | 401, 404 | `DELETE /FollowingRelationShip/delete-following-relation-ship` | TODO |
| GET | `/users/{userId}/followers` | Bearer | path `userId`, query `pageNumber`, `pageSize` | 200 `data` = `PagedResult<UserSummaryDto>` | 401, 404 | `GET /FollowingRelationShip/get-subscribers` | TODO |
| GET | `/users/{userId}/following` | Bearer | path `userId`, query `pageNumber`, `pageSize` | 200 `data` = `PagedResult<UserSummaryDto>` | 401, 404 | `GET /FollowingRelationShip/get-subscriptions` | TODO |

## 7. Posts — module folder `src/modules/posts/` (empty)

| Method | Path | Auth | Request | Success | Errors | Ref | Status |
|---|---|---|---|---|---|---|---|
| POST | `/posts` | Bearer | multipart `images` 1…10 (≤10 MB each), `title≤300`, `content≤2200`, `locationId?` | 201 `data` = `PostDto` | 400, 401, 404, 413 | `POST /Post/add-post` | TODO |
| GET | `/posts/{postId}` | Bearer | path `postId` (int) | 200 `data` = `PostDto` | 401, 403, 404 | `GET /Post/get-post-by-id` | TODO |
| GET | `/posts` | Bearer | query `userId?`, `title?`, `content?`, `pageNumber`, `pageSize` | 200 `data` = `PagedResult<PostDto>` | 400, 401 | `GET /Post/get-posts` | TODO |
| GET | `/users/me/posts` | Bearer | query `pageNumber`, `pageSize` | 200 `data` = `PagedResult<PostDto>` | 401 | `GET /Post/get-my-posts` | TODO |
| GET | `/posts/feed` | Bearer | query `pageNumber`, `pageSize` | 200 `data` = `PagedResult<PostDto>` of followed accounts | 401 | `GET /Post/get-following-post` | TODO |
| GET | `/reels` | Bearer | query `pageNumber`, `pageSize` | 200 `data` = `PagedResult<PostDto>` where `isReel = true` | 400, 401 | `GET /Post/get-reels` | TODO |
| DELETE | `/posts/{postId}` | Bearer | path `postId` (int) | 200 `data` = `null` | 401, 403, 404 | `DELETE /Post/delete-post` | TODO |
| POST | `/posts/{postId}/likes` | Bearer | path `postId` (int) | 200 `data` = `{likeCount: number}` | 401, 404, 409 | `POST /Post/like-post` | TODO |
| DELETE | `/posts/{postId}/likes` | Bearer | path `postId` (int) | 200 `data` = `{likeCount: number}` | 401, 404 | new | TODO |
| POST | `/posts/{postId}/views` | Bearer | path `postId` (int) | 200 `data` = `{viewCount: number}` | 401, 404 | `POST /Post/view-post` | TODO |

## 8. Comments — module folder `src/modules/comments/` (empty)

| Method | Path | Auth | Request | Success | Errors | Ref | Status |
|---|---|---|---|---|---|---|---|
| POST | `/posts/{postId}/comments` | Bearer | body `{content: string 1…500}` | 201 `data` = `CommentDto` | 400, 401, 404 | `POST /Post/add-comment` | TODO |
| GET | `/posts/{postId}/comments` | Bearer | path `postId`, query `pageNumber`, `pageSize` | 200 `data` = `PagedResult<CommentDto>` | 401, 404 | new | TODO |
| DELETE | `/comments/{commentId}` | Bearer | path `commentId` (int) | 200 `data` = `null` | 401, 403, 404 | `DELETE /Post/delete-comment` | TODO |

## 9. Favorites — module folder `src/modules/favorites/` (empty)

| Method | Path | Auth | Request | Success | Errors | Ref | Status |
|---|---|---|---|---|---|---|---|
| POST | `/favorites` | Bearer | body `{postId: int}` | 200 `data` = `FavoriteDto` | 401, 404, 409 | `POST /Post/add-post-favorite` | TODO |
| DELETE | `/favorites/{postId}` | Bearer | path `postId` (int) | 200 `data` = `null` | 401, 404 | new | TODO |
| GET | `/users/me/favorites` | Bearer | query `pageNumber`, `pageSize` | 200 `data` = `PagedResult<PostDto>` | 401 | `GET /UserProfile/get-post-favorites` | TODO |

## 10. Stories — module folder `src/modules/stories/` (empty)

| Method | Path | Auth | Request | Success | Errors | Ref | Status |
|---|---|---|---|---|---|---|---|
| POST | `/stories` | Bearer | multipart `image` (jpg/png/webp, ≤10 MB), `postId?` | 201 `data` = `StoryDto` with `expiresAt` | 400, 401, 404, 413 | `POST /Story/AddStories` | TODO |
| GET | `/stories` | Bearer | query `pageNumber`, `pageSize` | 200 `data` = `PagedResult<StoryDto>` of followed accounts, not expired | 401 | `GET /Story/get-stories` | TODO |
| GET | `/users/{userId}/stories` | Bearer | path `userId` | 200 `data` = `StoryDto[]`, not expired | 404 | `GET /Story/get-user-stories/{userId}` | TODO |
| GET | `/users/me/stories` | Bearer | none | 200 `data` = `StoryDto[]`, not expired | 401 | `GET /Story/get-my-stories` | TODO |
| GET | `/stories/{storyId}` | Bearer | path `storyId` (int) | 200 `data` = `StoryDto` | 401, 404 expired | `GET /Story/GetStoryById` | TODO |
| POST | `/stories/{storyId}/likes` | Bearer | path `storyId` (int) | 200 `data` = `{likeCount: number}` | 401, 404, 409 | `POST /Story/LikeStory` | TODO |
| POST | `/stories/{storyId}/views` | Bearer | path `storyId` (int) | 200 `data` = `StoryViewDto` | 401, 404 | `POST /Story/add-story-view` | TODO |
| DELETE | `/stories/{storyId}` | Bearer | path `storyId` (int) | 200 `data` = `null` | 401, 403, 404 | `DELETE /Story/DeleteStory` | TODO |

## 11. Chats — module folder `src/modules/chats/` (missing)

| Method | Path | Auth | Request | Success | Errors | Ref | Status |
|---|---|---|---|---|---|---|---|
| GET | `/chats` | Bearer | query `pageNumber`, `pageSize` | 200 `data` = `PagedResult<ChatDto>` | 401 | `GET /Chat/get-chats` | TODO |
| GET | `/chats/{chatId}` | Bearer | path `chatId` (int) | 200 `data` = `ChatDto` with messages | 401, 403, 404 | `GET /Chat/get-chat-by-id` | TODO |
| POST | `/chats` | Bearer | body `{receiverUserId: int}` | 200 `data` = `ChatDto` | 400 self, 401, 404, 409 | `POST /Chat/create-chat` | TODO |
| POST | `/chats/{chatId}/messages` | Bearer | multipart or json `{text?≤2000, file?}` | 201 `data` = `MessageDto` | 400, 401, 403, 404, 413 | `PUT /Chat/send-message` | TODO |
| DELETE | `/chats/{chatId}/messages/{messageId}` | Bearer | path `chatId`, `messageId` | 200 `data` = `null` | 401, 403, 404 | `DELETE /Chat/delete-message` | TODO |
| DELETE | `/chats/{chatId}` | Bearer | path `chatId` (int) | 200 `data` = `null` | 401, 403, 404 | `DELETE /Chat/delete-chat` | TODO |

## 12. Locations — module folder `src/modules/locations/` (missing)

| Method | Path | Auth | Request | Success | Errors | Ref | Status |
|---|---|---|---|---|---|---|---|
| GET | `/locations` | Bearer | query `city?`, `state?`, `zipCode?`, `country?`, `pageNumber`, `pageSize` | 200 `data` = `PagedResult<LocationDto>` | 400, 401 | `GET /Location/get-Locations` | TODO |
| GET | `/locations/{locationId}` | Bearer | path `locationId` (int) | 200 `data` = `LocationDto` | 401, 404 | `GET /Location/get-Location-by-id` | TODO |
| POST | `/locations` | Bearer (admin) | body `{name, city, state, country, zipCode}` | 201 `data` = `LocationDto` | 400, 401, 403 | `POST /Location/add-Location` | TODO |
| PUT | `/locations/{locationId}` | Bearer (admin) | body `{name?, city?, state?, country?, zipCode?}` | 200 `data` = `LocationDto` | 400, 401, 403, 404 | `PUT /Location/update-Location` | TODO |
| DELETE | `/locations/{locationId}` | Bearer (admin) | path `locationId` (int) | 200 `data` = `null` | 401, 403, 404 | `DELETE /Location/delete-Location` | TODO |

## 13. Summary

| Group | DONE | PARTIAL | TODO | Total |
|---|---|---|---|---|
| Platform | 1 | 0 | 0 | 1 |
| Account | 0 | 5 | 0 | 5 |
| Users | 0 | 0 | 4 | 4 |
| Search history | 0 | 0 | 8 | 8 |
| Profiles | 0 | 0 | 6 | 6 |
| Follows | 0 | 0 | 4 | 4 |
| Posts | 0 | 0 | 10 | 10 |
| Comments | 0 | 0 | 3 | 3 |
| Favorites | 0 | 0 | 3 | 3 |
| Stories | 0 | 0 | 8 | 8 |
| Chats | 0 | 0 | 6 | 6 |
| Locations | 0 | 0 | 5 | 5 |
| **Total** | **1** | **5** | **57** | **63** |

63 endpoints: 1 real, 5 legacy stubs, 57 to build. 52 of the 57 replace a route of
the reference spec, 5 are new (`GET /users/me`, `GET /users/{userId}`,
`DELETE /posts/{postId}/likes`, `GET /posts/{postId}/comments`,
`DELETE /favorites/{postId}`).
