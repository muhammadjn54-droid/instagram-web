# API CONTRACT — Instagram-like Social Network API

| Field | Value |
|---|---|
| Version | v1.0 — **verified against the running code on 2026-10-23** (replaces the v0.1 plan of 2026-10-21, in which every route was TODO) |
| Base URL | `http://localhost:3000` (dev) |
| Swagger UI | `/swagger` and `/api` (generated from the controllers) |
| Wrapper | every response is `{statusCode, data, errors}` (`src/common/responses/api-response.ts`); lists use `PagedResult` `{items,totalCount,pageNumber,pageSize,totalPages}` |
| Auth | `Authorization: Bearer <JWT>`. Routes marked **public\*** are open but read the token when one is sent (optional authentication) |
| Validation | global `ValidationPipe`: `whitelist`, `forbidNonWhitelisted`, `transform`. `pageNumber ≥ 1`, `pageSize 1…100` |
| Uploads | JPG / PNG / WEBP, **5 MB** per file, files served from `/uploads/<name>` |

**Status legend:** **DONE** exists and was exercised against a running server · **GAP** documented rule not implemented yet.

Error codes: 400 validation / business rule · 401 no or bad token · 403 not allowed · 404 not found · 409 already exists.

---

## 1. Platform

| Method | Path | Auth | Status |
|---|---|---|---|
| GET | `/` | public | DONE |

## 2. Account — `modules/account`

| Method | Path | Auth | Request | Success `data` | Errors | Status |
|---|---|---|---|---|---|---|
| POST | `/account/register` | public | `{userName (letters, digits, . _), fullName, email, password ≥6, confirmPassword}` | `"User registered successfully"` (201) | 400 mismatch/validation, 409 username/e-mail taken | DONE |
| POST | `/account/login` | public | `{userName (username **or** e-mail), password}` | `{accessToken, refreshToken, expiresAt, user}` | 401 | DONE |
| POST | `/account/refresh-token` | public | `{refreshToken}` | new token pair | 401 | DONE |
| POST | `/account/logout` | Bearer | — | `"Logged out successfully"` (revokes the refresh token) | 401 | DONE |
| POST | `/account/forgot-password` | public | `{email}` | dev: `"Password reset token has been generated: <token>"`; production: generic text | 404 unknown e-mail | DONE |
| POST | `/account/reset-password` | public | `{token,email,password,confirmPassword}` | `"Password reset successfully"` | 400 bad/expired/used token | DONE |
| PUT | `/account/change-password` | Bearer | `{oldPassword,password,confirmPassword}` | `"Password changed successfully"` | 400 wrong old password | DONE |

## 3. Users — `modules/users`

| Method | Path | Auth | Request | Success `data` | Status |
|---|---|---|---|---|---|
| GET | `/users` | public\* | `search?` (name / full name / e-mail), `pageNumber`, `pageSize` | `PagedResult<UserListItem>` | DONE (GAP: e-mail is searchable) |
| GET | `/users/:id` | public\* | — | `UserDetail` (`email` only for the caller's own id) | DONE |
| DELETE | `/users/me` | Bearer | — | `"Your account has been deleted successfully"` | DONE |

`GET /users/me` does **not** exist — use `GET /profiles/me`.

## 4. Profiles — `modules/profiles`

| Method | Path | Auth | Request | Success `data` | Status |
|---|---|---|---|---|---|
| GET | `/profiles/me` | Bearer | — | `ProfileDetail` | DONE |
| GET | `/profiles/:userId` | public\* | — | `ProfileDetail` (`isFollowing` for the caller) | DONE |
| PATCH | `/profiles/me` | Bearer | `{fullName?,userName?,bio?,website?,gender? (0\|1),isPrivate?}` | `ProfileDetail` (409 username taken) | DONE |
| PUT | `/profiles/me/avatar` | Bearer | multipart `image` | `"/uploads/<file>"` | DONE |
| DELETE | `/profiles/me/avatar` | Bearer | — | `"Avatar removed"` | DONE |
| GET | `/profiles/me/favorites` | Bearer | `pageNumber,pageSize` | `PagedResult<PostDto>` | DONE (was leaking raw rows — fixed) |

## 5. Follows — `modules/follows`

| Method | Path | Auth | Success `data` | Errors | Status |
|---|---|---|---|---|---|
| POST | `/users/:userId/follow` | Bearer | `"Now following <name>"` | 400 self, 404, 409 already | DONE |
| DELETE | `/users/:userId/follow` | Bearer | `"Unfollowed successfully"` | 404 | DONE |
| GET | `/users/:userId/followers` | public\* | `PagedResult<FollowUser>` | 404 | DONE |
| GET | `/users/:userId/following` | public\* | `PagedResult<FollowUser>` | 404 | DONE |

## 6. Posts — `modules/posts`

| Method | Path | Auth | Request | Success `data` | Status |
|---|---|---|---|---|---|
| GET | `/posts` | public\* | `userId?,title?,isReel?,pageNumber,pageSize` | `PagedResult<PostDto>` | DONE (`isReel=false` fixed) |
| GET | `/posts/feed` | Bearer | `pageNumber,pageSize` | own + followed users' posts | DONE |
| GET | `/posts/reels` | public\* | `pageNumber,pageSize` | `PagedResult<PostDto>` (`isReel=true`) | DONE |
| GET | `/posts/me` | Bearer | `pageNumber,pageSize` | own posts | DONE |
| GET | `/posts/:id` | public\* | — | `PostDto` | DONE |
| POST | `/posts` | Bearer | multipart `images` (1…10), `title?`, `content?`, `locationId?`, `isReel?` | `PostDto` (201) | DONE |
| PATCH | `/posts/:id` | Bearer (owner) | `{title?,content?,locationId?}` | `PostDto` | DONE |
| DELETE | `/posts/:id` | Bearer (owner) | — | `"Post deleted successfully"` | DONE |
| POST | `/posts/:id/like` | Bearer | — | `"Post liked"` (409 already) | DONE |
| DELETE | `/posts/:id/like` | Bearer | — | `"Post unliked"` | DONE |
| POST | `/posts/:id/view` | Bearer | — | `"View recorded"` | DONE |

`PostDto`: `id,userId,userName,userAvatar,title?,content,images[],location?,likesCount,commentsCount,viewsCount,isLikedByMe,isFavoriteByMe,isReel,createdAt`.

## 7. Comments — `modules/comments`

| Method | Path | Auth | Request | Success `data` | Status |
|---|---|---|---|---|---|
| GET | `/posts/:postId/comments` | public\* | `pageNumber,pageSize` | `PagedResult<CommentDto>` | DONE |
| POST | `/posts/:postId/comments` | Bearer | `{comment 1…500}` | `CommentDto` (201) | DONE |
| DELETE | `/comments/:id` | Bearer (comment owner **or** post owner) | — | `"Comment deleted successfully"` | DONE |

## 8. Favorites — `modules/favorites`

| Method | Path | Auth | Success `data` | Status |
|---|---|---|---|---|
| POST | `/posts/:postId/favorite` | Bearer | `"Post added to favorites"` (409 already) | DONE |
| DELETE | `/posts/:postId/favorite` | Bearer | `"Post removed from favorites"` | DONE |

## 9. Stories — `modules/stories`

| Method | Path | Auth | Request | Success `data` | Status |
|---|---|---|---|---|---|
| GET | `/stories` | Bearer | — | `UserStoriesGroup[]` (own + followed, not expired) | DONE |
| GET | `/stories/me` | Bearer | — | `StoryDto[]` | DONE |
| GET | `/stories/user/:userId` | public\* | — | `StoryDto[]` | DONE |
| GET | `/stories/:id` | public\* | — | `StoryDto` (404 expired) | DONE |
| POST | `/stories` | Bearer | multipart `image`, `postId?` | `StoryDto` with `expiresAt` (201) | DONE |
| DELETE | `/stories/:id` | Bearer (owner) | — | `"Story deleted successfully"` | DONE |
| POST / DELETE | `/stories/:id/like` | Bearer | — | `"Story liked"` / `"Story unliked"` | DONE |
| POST | `/stories/:id/views` | Bearer | — | `"Story view recorded"` | DONE |
| GET | `/stories/:id/viewers` | Bearer (owner) | — | `StoryViewer[]` (403 for others) | DONE |

## 10. Chats — `modules/chats`

| Method | Path | Auth | Request | Success `data` | Status |
|---|---|---|---|---|---|
| GET | `/chats` | Bearer | — | `ChatListItem[]` (with `lastMessage`) | DONE |
| POST | `/chats` | Bearer | `{receiverUserId}` | `ChatListItem` (finds or creates) | DONE |
| GET | `/chats/:chatId` | Bearer (member) | — | `ChatListItem` | DONE |
| GET | `/chats/:chatId/messages` | Bearer (member) | `pageNumber,pageSize` | `PagedResult<MessageDto>` **newest first** | DONE |
| POST | `/chats/:chatId/messages` | Bearer (member) | JSON `{text}` **or** multipart `text?` + `file` | `MessageDto` (201) | DONE |
| PATCH | `/chats/:chatId/read` | Bearer (member) | — | `"Messages marked as read"` | DONE |
| DELETE | `/chats/:chatId/messages/:messageId` | Bearer | — | `"Message deleted"` | DONE |
| DELETE | `/chats/:chatId` | Bearer (member) | — | `"Chat deleted"` | DONE |

## 11. Locations — `modules/locations`

| Method | Path | Auth | Request | Success `data` | Status |
|---|---|---|---|---|---|
| GET | `/locations` | public | `search?,pageNumber,pageSize` | `PagedResult<Location>` | DONE |
| GET | `/locations/:id` | public | — | `Location` | DONE |
| POST | `/locations` | Bearer | `{name,city?,state?,country?,zipCode?}` | `Location` | DONE (GAP: no admin role check) |
| PUT | `/locations/:id` | Bearer | partial body | `Location` | DONE (same GAP) |
| DELETE | `/locations/:id` | Bearer | — | `"Location deleted successfully"` | DONE (same GAP) |

## 12. Search history — `modules/search-history`

| Method | Path | Auth | Request | Success `data` | Status |
|---|---|---|---|---|---|
| POST | `/search-history` | Bearer | `{text?,searchedUserId?}` | `SearchHistoryItem` (201) | DONE |
| GET | `/search-history` | Bearer | — | `SearchHistoryItem[]` newest first | DONE |
| DELETE | `/search-history/:id` | Bearer | — | `"Search history item deleted"` | DONE |
| DELETE | `/search-history` | Bearer | — | `"Search history cleared successfully"` | DONE |

## 13. Notifications — `modules/notifications`

| Method | Path | Auth | Success `data` | Status |
|---|---|---|---|---|
| GET | `/notifications` | Bearer | `NotificationDto[]` — newest first, at most 100: new followers, likes and comments on my posts, likes on my stories. Derived from existing tables (nothing is stored). | DONE |

`NotificationDto`: `{id: "<type>-<rowId>", type: "follow"|"like"|"comment"|"story_like", actor: {id,userName,fullName,avatar,isFollowing}, text? (comment), target?: {postId?, image?}, createdAt}`. There is no read / unread state yet.

## 14. Summary

| Group | Endpoints |
|---|---|
| Platform | 1 |
| Account | 7 |
| Users | 3 |
| Profiles | 6 |
| Follows | 4 |
| Posts | 11 |
| Comments | 3 |
| Favorites | 2 |
| Stories | 10 |
| Chats | 8 |
| Locations | 5 |
| Search history | 4 |
| Notifications | 1 |
| **Total** | **65** |

Open items: private accounts are not enforced by the API (GAP-6), e-mail is searchable (GAP-7), locations have no admin check, no rate limiting, hard-coded fallback `JWT_SECRET` (set the env variable). See `../tz.md` and `../specs/SECURITY.md`.
