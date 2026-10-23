# API CONTRACT — Frontend ↔ Backend

> **STATUS NOTE (2026-10-23):** historical plan. The verified contract is `../../backend/API_CONTRACT.md` and `../../specs/API_INTEGRATION.md`.


| Field | Value |
|---|---|
| Backend | `backend/` — NestJS 12, base URL `http://localhost:3000` |
| Swagger UI | `http://localhost:3000/swagger` and `http://localhost:3000/api` |
| Auth | `Authorization: Bearer <accessToken>` |
| Date | 2026-10-21 |
| Related | `../tz.md` §11, `ARCHITECTURE.md` §6–§7, `AUTH.md` |

> **Backend readiness warning.** At the time of writing only `AccountModule`
> is mounted in `backend/src/app.module.ts`. The controllers for posts,
> profiles, follows, comments, favorites, stories, users, search-history and
> chats exist but are **not registered**, so they answer `404`. The global
> response interceptor, the global JWT guard and the exception filter are
> **defined but never registered** either. The contract below is the
> **documented intent** (it matches the DTOs and the Swagger document), and
> the client code must tolerate both the enveloped and the bare shape.

## 1. Response envelope

Success (as documented in `backend/src/common/responses/api-response.ts`):

```json
{
  "statusCode": 200,
  "data": { "id": 12, "userName": "muhammad" },
  "errors": null
}
```

Failure (as documented in `backend/src/common/filters/http-exception.filter.ts`):

```json
{
  "statusCode": 404,
  "data": null,
  "errors": ["Post with ID 5 not found"]
}
```

`errors` is always a `string[]`. There is no `message` / `error` /
`timestamp` field.

Because the interceptor is not registered yet, **the client must accept a bare
payload too**. `src/lib/api/client.ts` detects the envelope by the presence of
all three keys (`statusCode`, `data`, `errors`) and falls back to the raw body
otherwise. See `ARCHITECTURE.md` §6.

## 2. Pagination

Request query parameters (`backend/src/common/dto/pagination.dto.ts`):

| Parameter | Type | Default | Min | Max |
|---|---|---|---|---|
| `pageNumber` | int | 1 | 1 | — |
| `pageSize` | int | 10 | 1 | 100 |

Response `data`:

```json
{
  "items": [ /* … */ ],
  "totalCount": 137,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 14
}
```

> The names are `pageNumber` / `pageSize`, **not** `page` / `limit`.
> `GET /chats/:chatId/messages` defaults to **20** items per page.

## 3. Uploads

| Property | Value |
|---|---|
| Transport | `multipart/form-data` |
| Max size | **5 MB** per file (`5 * 1024 * 1024`) |
| Allowed types | `jpg`, `jpeg`, `png`, `webp` (regex `/\/(jpg|jpeg|png|webp)$/`) |
| Storage | `./uploads` on the backend, served at `/uploads/<filename>` |
| Filename | `${Date.now()}-${random}${ext}` |

Field names per endpoint:

| Endpoint | Field | Count |
|---|---|---|
| `POST /posts` | `images` | 1–10 (array) |
| `PUT /profiles/me/avatar` | `image` | 1 |
| `POST /stories` | `image` | 1 |
| `POST /chats/:chatId/messages` | `file` | 0–1 |

## 4. Authentication

| Method | Path | Public | Body | Response `data` |
|---|---|---|---|---|
| `POST` | `/account/register` | ✅ | `userName`, `fullName`, `email`, `password`, `confirmPassword` | `"User registered successfully"` (201) |
| `POST` | `/account/login` | ✅ | `userName`, `password` | `AuthResponseDto` |
| `POST` | `/account/refresh-token` | ✅ | `refreshToken` | `AuthResponseDto` |
| `POST` | `/account/logout` | ❌ | — | `"Logged out successfully"` |
| `POST` | `/account/forgot-password` | ✅ | `email` | a token string |
| `POST` | `/account/reset-password` | ✅ | `token`, `email`, `password`, `confirmPassword` | `"Password reset successfully"` |
| `PUT` | `/account/change-password` | ❌ | `oldPassword`, `password`, `confirmPassword` | `"Password changed successfully"` |

Validation (from `backend/src/modules/account/dto/account.dto.ts`):

| Field | Rules |
|---|---|
| `userName` | required, `^[a-zA-Z0-9._]+$` |
| `fullName` | required, no length limit |
| `email` | required, valid email |
| `password` | required, `minLength(6)` |
| `confirmPassword` | required, `minLength(6)`, must equal `password` |

> The field is `userName` (capital **N**), everywhere — register, login and
> the profile DTO. The undecorated stubs `register.dto.ts` / `login.dto.ts`
> are **not** the DTOs the controller uses.

### Login response

```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "ref-3-1758470000000",
    "expiresAt": 86400,
    "user": {
      "id": 3,
      "userName": "muhammad",
      "fullName": "Muhammad R.",
      "email": "m@example.com",
      "avatar": "/uploads/avatar.jpg"
    }
  },
  "errors": null
}
```

* `accessToken` — a real JWT, `exp` = 1 day.
* `refreshToken` — **not a JWT**; it is the string `ref-<userId>-<timestamp>`.
  The backend has no refresh-token endpoint that issues a real JWT, so the
  frontend re-authenticates instead of refreshing.
* `expiresAt` — **seconds** (86400), not an absolute timestamp.

## 5. Endpoint inventory

`@Public` = no token required. Everything else needs `Authorization: Bearer …`.

### Users

| Method | Path | Public | Query / body | `data` |
|---|---|---|---|---|
| `GET` | `/users` | ✅ | `pageNumber`, `pageSize`, `search?` | `PagedResult<UserListItemDto>` |
| `GET` | `/users/:id` | ✅ | — | `UserDetailDto` |
| `DELETE` | `/users/me` | ❌ | — | `"Your account has been deleted successfully"` |

### Profiles

| Method | Path | Public | Query / body | `data` |
|---|---|---|---|---|
| `GET` | `/profiles/me` | ❌ | — | `ProfileDetailDto` |
| `GET` | `/profiles/:userId` | ✅ | — | `ProfileDetailDto` |
| `PATCH` | `/profiles/me` | ❌ | `fullName?`, `userName?`, `bio?`, `website?`, `gender?`, `isPrivate?` | `ProfileDetailDto` |
| `PUT` | `/profiles/me/avatar` | ❌ | multipart `image` | the avatar URL (string) |
| `DELETE` | `/profiles/me/avatar` | ❌ | — | `"Avatar removed"` |
| `GET` | `/profiles/me/favorites` | ❌ | `pageNumber`, `pageSize` | `PagedResult<Post>` (raw entities, **not** `PostDto`) |

> `gender` is an enum: `0 = Male`, `1 = Female` (there is no "other" value in
> the backend enum).

### Follows

| Method | Path | Public | Query / body | `data` |
|---|---|---|---|---|
| `POST` | `/users/:userId/follow` | ❌ | — | `"Now following <userName>"` |
| `DELETE` | `/users/:userId/follow` | ❌ | — | `"Unfollowed successfully"` |
| `GET` | `/users/:userId/followers` | ✅ | `pageNumber`, `pageSize` | `PagedResult<FollowUserDto>` |
| `GET` | `/users/:userId/following` | ✅ | `pageNumber`, `pageSize` | `PagedResult<FollowUserDto>` |

> Self-follow → `400`. Duplicate follow → `409`.
> Both `UsersController` and `FollowsController` use the `users` prefix —
> a route conflict exists in the backend for `GET /users/:id` vs
> `GET /users/:userId/followers` and `DELETE /users/me`.

### Posts

| Method | Path | Public | Query / body | `data` |
|---|---|---|---|---|
| `GET` | `/posts` | ✅ | `pageNumber`, `pageSize`, `userId?`, `title?`, `isReel?` | `PagedResult<PostDto>` |
| `GET` | `/posts/feed` | ❌ | `pageNumber`, `pageSize` | `PagedResult<PostDto>` |
| `GET` | `/posts/reels` | ✅ | `pageNumber`, `pageSize` | `PagedResult<PostDto>` (`isReel = true`) |
| `GET` | `/posts/me` | ❌ | `pageNumber`, `pageSize` | `PagedResult<PostDto>` |
| `GET` | `/posts/:id` | ✅ | — | `PostDto` |
| `POST` | `/posts` | ❌ | multipart `images` (1–10), `title?`, `content?`, `locationId?`, `isReel?` | `PostDto` (201) |
| `PATCH` | `/posts/:id` | ❌ | `title?`, `content?`, `locationId?` | `PostDto` |
| `DELETE` | `/posts/:id` | ❌ | — | `"Post deleted successfully"` |
| `POST` | `/posts/:id/like` | ❌ | — | `"Post liked"` |
| `DELETE` | `/posts/:id/like` | ❌ | — | `"Post unliked"` |
| `POST` | `/posts/:id/view` | ❌ | — | `"View recorded"` |

> The caption field is `content`; `title` is an optional short heading.
> A post needs **at least one** image or the request is rejected.

### Comments

| Method | Path | Public | Query / body | `data` |
|---|---|---|---|---|
| `GET` | `/posts/:postId/comments` | ✅ | `pageNumber`, `pageSize` | `PagedResult<CommentDto>` |
| `POST` | `/posts/:postId/comments` | ❌ | **`comment`** (1–500 chars) | `CommentDto` (201) |
| `DELETE` | `/comments/:id` | ❌ | — | `"Comment deleted successfully"` |

> **Asymmetry to remember:** the request body field is `comment`, the response
> field is `content`. Do not rename one to match the other.

### Favorites

| Method | Path | Public | Query / body | `data` |
|---|---|---|---|---|
| `POST` | `/posts/:postId/favorite` | ❌ | — | `"Post added to favorites"` |
| `DELETE` | `/posts/:postId/favorite` | ❌ | — | `"Post removed from favorites"` |

### Stories

| Method | Path | Public | Query / body | `data` |
|---|---|---|---|---|
| `GET` | `/stories` | ❌ | — | `UserStoriesGroupDto[]` |
| `GET` | `/stories/me` | ❌ | — | `StoryDto[]` |
| `GET` | `/stories/user/:userId` | ✅ | — | `StoryDto[]` |
| `GET` | `/stories/:id` | ✅ | — | `StoryDto` |
| `POST` | `/stories` | ❌ | multipart `image`, `postId?` | `StoryDto` (201) |
| `DELETE` | `/stories/:id` | ❌ | — | `"Story deleted successfully"` |
| `POST` | `/stories/:id/like` | ❌ | — | `"Story liked"` |
| `DELETE` | `/stories/:id/like` | ❌ | — | `"Story unliked"` |
| `POST` | `/stories/:id/views` | ❌ | — | `"Story view recorded"` |
| `GET` | `/stories/:id/viewers` | ❌ | — | `StoryViewerDto[]` |

> A story expires 24 h after `createdAt`; the backend filters expired stories
> out of the listings, and `expiresAt` is on the DTO so the UI can double-check.

### Chats

| Method | Path | Public | Query / body | `data` |
|---|---|---|---|---|
| `GET` | `/chats` | ❌ | — | `ChatListItemDto[]` |
| `POST` | `/chats` | ❌ | `receiverUserId` | `ChatListItemDto` (get-or-create) |
| `GET` | `/chats/:chatId` | ❌ | — | `ChatListItemDto` |
| `GET` | `/chats/:chatId/messages` | ❌ | `pageNumber`, `pageSize` (default 20) | `PagedResult<MessageDto>` |
| `POST` | `/chats/:chatId/messages` | ❌ | multipart `file?`, `text?` | `MessageDto` (201) |
| `DELETE` | `/chats/:chatId/messages/:messageId` | ❌ | — | `"Message deleted"` |
| `DELETE` | `/chats/:chatId` | ❌ | — | `"Chat deleted"` |

> `text` **or** `file` must be present.

### Search history

| Method | Path | Public | Query / body | `data` |
|---|---|---|---|---|
| `POST` | `/search-history` | ❌ | `text?`, `searchedUserId?` | `SearchHistoryItemDto` (201) |
| `GET` | `/search-history` | ❌ | — | `SearchHistoryItemDto[]` (max 50) |
| `DELETE` | `/search-history/:id` | ❌ | — | `"Search history item deleted"` |
| `DELETE` | `/search-history` | ❌ | — | `"Search history cleared successfully"` |

> `searchedUserId` has **no** `@Type(() => Number)` coercion in the backend
> DTO — send it as a JSON **number**, not a string.

### Locations — **not implemented**

There is a `Location` entity and `Post.locationId`, but **no locations
module, controller or route**. The frontend therefore cannot list or search
locations. `POST /posts` accepts a numeric `locationId`; the create-post form
offers a plain numeric field labelled "Location id (temporary)" until the
backend ships `GET /locations`.

## 6. Response DTOs

### `PostDto`

```ts
export type PostDto = {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  title?: string;
  content: string;
  images: string[];              // ordered by `order`
  location?: { id: number; name: string; city?: string; country?: string };
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  isLikedByMe: boolean;
  isFavoriteByMe: boolean;
  isReel: boolean;
  createdAt: string;             // ISO 8601
};
```

### `ProfileDetailDto`

```ts
export type ProfileDetailDto = {
  userId: number;
  userName: string;
  fullName: string;
  bio: string;
  avatar: string;
  website: string;
  gender: number;                // 0 = Male, 1 = Female
  isPrivate: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
};
```

### `UserListItemDto` / `UserDetailDto`

```ts
export type UserListItemDto = {
  id: number;
  userName: string;
  fullName: string;
  avatar: string;
  followersCount: number;
  isFollowing: boolean;
};

export type UserDetailDto = UserListItemDto & {
  email: string;
  bio: string;
  website: string;
  gender: number;
  isPrivate: boolean;
  followingCount: number;
  postsCount: number;
  createdAt: string;
};
```

### `CommentDto`

```ts
export type CommentDto = {
  id: number;
  postId: number;
  userId: number;
  userName: string;
  userAvatar: string;
  content: string;               // note: request field was `comment`
  createdAt: string;
};
```

### `StoryDto`

```ts
export type StoryDto = {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  imageUrl: string;
  postId?: number;
  likesCount: number;
  viewsCount: number;
  isLikedByMe: boolean;
  expiresAt: string;             // ISO 8601, createdAt + 24 h
  createdAt: string;
};

export type UserStoriesGroupDto = {
  userId: number;
  userName: string;
  userAvatar: string;
  stories: StoryDto[];
};

export type StoryViewerDto = {
  userId: number;
  userName: string;
  userAvatar: string;
  viewedAt: string;
};
```

### `ChatListItemDto` / `MessageDto`

```ts
export type ChatUserDto = { id: number; userName: string; fullName: string; avatar: string };

export type MessageDto = {
  id: number;
  chatId: number;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  text?: string;
  fileUrl?: string;
  isRead: boolean;
  createdAt: string;
};

export type ChatListItemDto = {
  id: number;
  otherUser: ChatUserDto;
  lastMessage?: MessageDto;
  createdAt: string;
  updatedAt: string;
};
```

### `FollowUserDto` / `SearchHistoryItemDto`

```ts
export type FollowUserDto = {
  userId: number;
  userName: string;
  fullName: string;
  avatar: string;
  isFollowing: boolean;
};

export type SearchHistoryItemDto = {
  id: number;
  userId: number;
  text?: string;
  searchedUserId?: number;
  searchedUserName?: string;
  searchedUserAvatar?: string;
  createdAt: string;
};
```

## 7. Error mapping

| Status | Meaning | UI behaviour |
|---|---|---|
| 400 | Validation / business rule violated | Field-level error on the form |
| 401 | Missing or expired token | Clear the session, redirect to `/login?next=…` |
| 403 | Not the owner | Show "You do not have permission to do this" |
| 404 | Resource missing | `notFound()` for a page, an empty state for a list |
| 409 | Unique conflict (already liked, duplicate user, already following) | Treat as success for toggles; a field error for register |
| 5xx | Backend failure | Error boundary with a retry button |

The backend's `errors` array carries human-readable strings, e.g.
`"User already exists"`, `"Passwords do not match"`, `"Post with ID 5 not
found"`.

## 8. Endpoint constants

All paths live in one file so a backend rename is a one-line change:

```ts
// src/lib/api/endpoints.ts
export const ENDPOINTS = {
  auth: {
    register: "/account/register",
    login: "/account/login",
    logout: "/account/logout",
    forgotPassword: "/account/forgot-password",
    resetPassword: "/account/reset-password",
    changePassword: "/account/change-password",
  },
  users: { list: "/users", me: "/users/me", byId: (id: number) => `/users/${id}` },
  profiles: {
    me: "/profiles/me",
    byId: (id: number) => `/profiles/${id}`,
    avatar: "/profiles/me/avatar",
    favorites: "/profiles/me/favorites",
  },
  follows: {
    follow: (id: number) => `/users/${id}/follow`,
    followers: (id: number) => `/users/${id}/followers`,
    following: (id: number) => `/users/${id}/following`,
  },
  posts: {
    list: "/posts",
    feed: "/posts/feed",
    reels: "/posts/reels",
    mine: "/posts/me",
    byId: (id: number) => `/posts/${id}`,
    like: (id: number) => `/posts/${id}/like`,
    view: (id: number) => `/posts/${id}/view`,
    favorite: (id: number) => `/posts/${id}/favorite`,
    comments: (id: number) => `/posts/${id}/comments`,
  },
  stories: {
    list: "/stories",
    mine: "/stories/me",
    byId: (id: number) => `/stories/${id}`,
    byUser: (id: number) => `/stories/user/${id}`,
    like: (id: number) => `/stories/${id}/like`,
    views: (id: number) => `/stories/${id}/views`,
    viewers: (id: number) => `/stories/${id}/viewers`,
  },
  chats: {
    list: "/chats",
    create: "/chats",
    byId: (id: number) => `/chats/${id}`,
    messages: (id: number) => `/chats/${id}/messages`,
    message: (chatId: number, messageId: number) => `/chats/${chatId}/messages/${messageId}`,
  },
  searchHistory: { list: "/search-history", byId: (id: number) => `/search-history/${id}` },
} as const;
```
