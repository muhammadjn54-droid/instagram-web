# API Integration Specification & Endpoint Contracts — Instagram Web Clone

> **Document Version:** 1.0  
> **Backend Engine:** NestJS 12 + TypeORM + SQLite  
> **Swagger URL:** `http://localhost:3000/swagger` | OpenAPI JSON: `http://localhost:3000/swagger-json`

---

## 1. Global API Standards

* **Base URL:** `http://localhost:3000`
* **Response Wrapper Envelope (`ApiResponse<T>`):**
  ```typescript
  export interface ApiResponse<T> {
    statusCode: number;      // 200, 201, 400, 401, 403, 404, 409
    data: T | null;          // Real payload on success, null on error
    errors: string[] | null; // Array of error strings or null
  }
  ```
* **Pagination Envelope (`PagedResult<T>`):**
  ```typescript
  export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  }
  ```
* **Authentication Header:**
  ```http
  Authorization: Bearer <accessToken>
  ```
* **Media Serving:**
  `http://localhost:3000/uploads/<filename>`

---

## 2. Endpoint Contract Reference

### Module 1: Account & Authentication (`/account`)
| Method | Endpoint | Auth | Request Body | Response `data` |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/account/register` | No | `{ userName, fullName, email, password, confirmPassword }` | `"User registered successfully"` |
| `POST` | `/account/login` | No | `{ userName, password }` (accepts username or email) | `{ accessToken, refreshToken, user }` |
| `POST` | `/account/refresh-token`| No | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| `POST` | `/account/logout` | Yes | — | `"Logged out successfully"` |
| `POST` | `/account/forgot-password`| No| `{ email }` | `"Password reset email sent"` |
| `POST` | `/account/reset-password` | No| `{ token, email, password, confirmPassword }` | `"Password reset successfully"` |
| `PUT` | `/account/change-password`| Yes| `{ oldPassword, password, confirmPassword }` | `"Password changed successfully"` |

### Module 2: Profiles & Users (`/profiles`, `/users`)
| Method | Endpoint | Auth | Query / Body | Response `data` |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/profiles/me` | Yes | — | Current `Profile` with counts |
| `GET` | `/profiles/:userId` | No/Yes| — | Other `Profile` with `isFollowing` boolean |
| `PATCH`| `/profiles/me` | Yes | `{ fullName?, bio?, website?, phone?, gender? }` | Updated `Profile` |
| `PUT` | `/profiles/me/avatar` | Yes | `multipart/form-data: image` | Updated `Profile` |
| `DELETE`|`/profiles/me/avatar` | Yes | — | Updated `Profile` |
| `GET` | `/profiles/me/favorites`| Yes| `?pageNumber=1&pageSize=12` | `PagedResult<Post>` |
| `GET` | `/users` | Yes | `?search=term&pageNumber=1&pageSize=20` | `PagedResult<User>` |
| `POST` | `/users/:userId/follow` | Yes| — | `"Followed successfully"` |
| `DELETE`|`/users/:userId/follow` | Yes| — | `"Unfollowed successfully"` |
| `GET` | `/users/:userId/followers`| Yes| `?pageNumber=1&pageSize=20` | `PagedResult<User>` |
| `GET` | `/users/:userId/following`| Yes| `?pageNumber=1&pageSize=20` | `PagedResult<User>` |

### Module 3: Posts & Interactions (`/posts`, `/comments`)
| Method | Endpoint | Auth | Query / Body | Response `data` |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/posts/feed` | Yes | `?pageNumber=1&pageSize=10` | `PagedResult<Post>` (followed users) |
| `GET` | `/posts` | No/Yes| `?pageNumber=1&pageSize=24&userId=&title=` | `PagedResult<Post>` (explore grid) |
| `GET` | `/posts/reels` | No/Yes| `?pageNumber=1&pageSize=10` | `PagedResult<Post>` (`isReel: true`) |
| `GET` | `/posts/:id` | No/Yes| — | Single `Post` with images and flags |
| `POST` | `/posts` | Yes | `multipart/form-data`: `images` (1-10 files), `title`, `content`, `locationId`, `isReel` | Created `Post` |
| `PATCH`| `/posts/:id` | Yes | `{ title?, content? }` | Updated `Post` |
| `DELETE`|`/posts/:id` | Yes | — | `"Post deleted successfully"` |
| `POST` | `/posts/:id/like` | Yes | — | `"Post liked"` |
| `DELETE`|`/posts/:id/like` | Yes | — | `"Post unliked"` |
| `POST` | `/posts/:id/favorite` | Yes | — | `"Post saved"` |
| `DELETE`|`/posts/:id/favorite` | Yes | — | `"Post removed from saved"` |
| `POST` | `/posts/:id/view` | No/Yes| — | `"View counted"` |
| `GET` | `/posts/:id/comments` | No/Yes| `?pageNumber=1&pageSize=20` | `PagedResult<Comment>` |
| `POST` | `/posts/:id/comments` | Yes | `{ comment: string }` | Created `Comment` |
| `DELETE`|`/comments/:id` | Yes | — | `"Comment deleted"` |

### Module 4: 24h Stories (`/stories`)
| Method | Endpoint | Auth | Details |
| :--- | :--- | :---: | :--- |
| `GET` | `/stories` | Yes | Feed stories grouped by user (`UserStoriesGroup[]`) |
| `GET` | `/stories/me` | Yes | Current user's active stories (`Story[]`) |
| `GET` | `/stories/user/:userId` | Yes | Active stories for specified user (`Story[]`) |
| `POST` | `/stories` | Yes | `multipart/form-data`: `image` (file) |
| `POST` | `/stories/:id/like` | Yes | Like story |
| `DELETE`|`/stories/:id/like` | Yes | Unlike story |
| `POST` | `/stories/:id/views` | Yes | Record view |
| `GET` | `/stories/:id/viewers`| Yes | Author-only list of viewer users |
| `DELETE`|`/stories/:id` | Yes | Author-only delete story |

### Module 5: Direct Messaging (`/chats`)
| Method | Endpoint | Auth | Details |
| :--- | :--- | :---: | :--- |
| `GET` | `/chats` | Yes | Active conversations list with last message |
| `POST` | `/chats` | Yes | `{ receiverUserId: number }` (finds or creates thread) |
| `GET` | `/chats/:chatId` | Yes | Chat details & participants |
| `GET` | `/chats/:chatId/messages`| Yes | `?pageNumber=1&pageSize=30` (`PagedResult<Message>`) |
| `POST` | `/chats/:chatId/messages`| Yes | JSON `{ text: "..." }` OR multipart with file attachment |
| `PATCH`| `/chats/:chatId/read` | Yes | Mark chat as read |
| `DELETE`|`/chats/:chatId/messages/:msgId` | Yes | Delete single message |
| `DELETE`|`/chats/:chatId` | Yes | Delete entire conversation |

### Module 6: Locations & Search History (`/locations`, `/search-history`)
| Method | Endpoint | Auth | Details |
| :--- | :--- | :---: | :--- |
| `GET` | `/locations` | Yes | `?search=city&pageNumber=1&pageSize=20` |
| `POST` | `/locations` | Yes | `{ name, address?, latitude?, longitude? }` |
| `GET` | `/search-history` | Yes | Recent searches list |
| `POST` | `/search-history` | Yes | `{ query, targetUserId? }` |
| `DELETE`|`/search-history/:id` | Yes | Remove single history entry |
| `DELETE`|`/search-history` | Yes | Clear all search history |
