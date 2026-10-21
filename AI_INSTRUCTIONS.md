# 🤖 AI Assistant Instructions (Cursor, Claude Code, Copilot, ChatGPT)

> **Role & Context:**  
> You are an expert Frontend Developer working on the **`frontend/`** directory of this Instagram Clone Monorepo.  
> The backend is already built with **NestJS 12 + TypeORM + SQLite** and runs at `http://localhost:3000`.  
> Your mission is to build clean, fast, responsive Next.js pages and components that connect seamlessly to this existing backend.

---

## 🚫 Critical Constraints (DO NOT BREAK)

1. **DO NOT invent or guess API endpoints.**  
   Use **ONLY** the real endpoints documented in [`FRONTEND_GUIDE.md`](./FRONTEND_GUIDE.md) or Swagger at `http://localhost:3000/swagger`.
2. **DO NOT invent mock data** if the user asks you to connect features. Connect to the real NestJS API.
3. **DO NOT change backend files** unless Mansur (the backend developer) explicitly asks you to. Your focus is `frontend/`.
4. **ALWAYS handle the standard backend response envelope:**
   ```typescript
   export interface ApiResponse<T> {
     statusCode: number;      // 200, 201, 400, 401, 404, 409
     data: T | null;          // Real payload on success
     errors: string[] | null; // Array of error strings or null
   }
   ```
   * When `statusCode >= 400` or `errors` is not null, extract `errors.join(', ')` or `message` and show user-friendly feedback.
   * On success, the useful payload is inside `res.data`.
5. **ALWAYS handle paginated lists:**
   ```typescript
   export interface PagedResult<T> {
     items: T[];
     totalCount: number;
     pageNumber: number;
     pageSize: number;
     totalPages: number;
   }
   ```
6. **JWT Authentication:**
   * Login returns `{ accessToken: string }`.
   * Pass it in request headers: `Authorization: Bearer <accessToken>`.
7. **Image URLs:**
   * The backend returns image paths like `/uploads/1729512345.jpg`.
   * Prepend the backend host to render: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${imagePath}`.
8. **File Uploads (Multer):**
   * Use `FormData` with `multipart/form-data`.
   * For posts: field name is `images` (can append multiple files, up to 10).
   * For avatars and stories: field name is `image` (single file).
   * For chat messages: field name is `file` (single file, optional) and `text` (optional).
   * Do NOT manually set `Content-Type: multipart/form-data` in `fetch`; let the browser set the boundary automatically!

---

## 🛠 Tech Stack in `frontend/`

- **Framework:** Next.js (App Router, Turbopack)
- **Language:** TypeScript (strict mode, zero `any` where possible)
- **Styling:** Tailwind CSS (modern utility classes, responsive mobile + desktop)
- **Icons:** Lucide React or standard SVG icons
- **State / Data Fetching:** React Hooks (`useState`, `useEffect`, `useCallback`) or Server Components where applicable.

---

## 📋 Complete API Quick Reference

### 1. Authentication (`/account`)
- `POST /account/register` -> Body: `{ userName, fullName, email, password, confirmPassword }`
- `POST /account/login` -> Body: `{ userName, password }` -> Returns: `{ accessToken }`
- `POST /account/refresh-token` -> Body: `{ refreshToken }`
- `POST /account/logout` -> Protected
- `POST /account/forgot-password` -> Body: `{ email }`
- `POST /account/reset-password` -> Body: `{ token, email, password, confirmPassword }`
- `PUT /account/change-password` -> Body: `{ oldPassword, password, confirmPassword }` (Protected)

### 2. Users & Profiles (`/users`, `/profiles`)
- `GET /profiles/me` -> Current user profile with counts (postsCount, followersCount, followingCount)
- `GET /profiles/:userId` -> Other user profile with `isFollowing` boolean
- `PATCH /profiles/me` -> Body: `{ fullName?, bio?, website?, phone?, gender? }`
- `PUT /profiles/me/avatar` -> Multipart Form: field `image`
- `DELETE /profiles/me/avatar` -> Removes avatar
- `GET /profiles/me/favorites` -> Query: `?pageNumber=1&pageSize=12` (saved posts)
- `GET /users` -> Query: `?search=term&pageNumber=1&pageSize=20` (user search)
- `POST /users/:userId/follow` -> Follow user
- `DELETE /users/:userId/follow` -> Unfollow user
- `GET /users/:userId/followers` -> Query: `?pageNumber=1&pageSize=20`
- `GET /users/:userId/following` -> Query: `?pageNumber=1&pageSize=20`

### 3. Posts & Feed (`/posts`)
- `GET /posts/feed` -> Protected. Posts from followed users. Query: `?pageNumber=1&pageSize=10`
- `GET /posts` -> Public/Protected. All posts (explore). Query: `?title=...&userId=...&pageNumber=1`
- `GET /posts/reels` -> Public/Protected. Reels only. Query: `?pageNumber=1&pageSize=10`
- `GET /posts/me` -> Protected. Posts by current user.
- `GET /posts/:id` -> Single post details (with images, user, likesCount, commentsCount, isLiked, isFavorited).
- `POST /posts` -> Protected. Multipart Form:
  - `images`: 1 to 10 image files (jpg, png, webp, max 5MB)
  - `title`: string (optional)
  - `content`: string (optional)
  - `locationId`: number (optional)
  - `isReel`: boolean (optional)
- `PATCH /posts/:id` -> Body: `{ title?, content? }` (Author only)
- `DELETE /posts/:id` -> (Author only)
- `POST /posts/:id/like` -> Likes post
- `DELETE /posts/:id/like` -> Unlikes post
- `POST /posts/:id/view` -> Increments view count
- `POST /posts/:id/favorite` -> Saves to bookmarks
- `DELETE /posts/:id/favorite` -> Removes from bookmarks

### 4. Comments (`/posts/:postId/comments`, `/comments`)
- `GET /posts/:postId/comments` -> Query: `?pageNumber=1&pageSize=20`
- `POST /posts/:postId/comments` -> Body: `{ comment: string }`
- `DELETE /comments/:id` -> Deletes comment (Author or Post Owner)

### 5. Stories (`/stories`)
- `GET /stories` -> 24h stories of followed users, grouped by user: `[{ user, stories: [...] }]`
- `GET /stories/me` -> Current user's active stories
- `GET /stories/user/:userId` -> Active stories of specified user
- `POST /stories` -> Multipart Form: field `image` (file), field `postId` (optional)
- `POST /stories/:id/like` -> Like story
- `DELETE /stories/:id/like` -> Unlike story
- `POST /stories/:id/views` -> Record view
- `GET /stories/:id/viewers` -> Viewers list (Author only)
- `DELETE /stories/:id` -> Delete story (Author only)

### 6. Direct Messages / Chats (`/chats`)
- `GET /chats` -> List of active conversations with lastMessage and unread count
- `POST /chats` -> Body: `{ receiverUserId: number }` -> Finds or creates conversation
- `GET /chats/:chatId` -> Chat details and participants
- `GET /chats/:chatId/messages` -> Message history. Query: `?pageNumber=1&pageSize=30`
- `POST /chats/:chatId/messages` ->
  - Simple JSON: `{ text: "Hello!" }`
  - OR Multipart Form: `text` (string) + `file` (image/attachment)
- `PATCH /chats/:chatId/read` -> Marks all messages as read
- `DELETE /chats/:chatId/messages/:messageId` -> Deletes single message
- `DELETE /chats/:chatId` -> Deletes conversation

### 7. Locations (`/locations`)
- `GET /locations` -> Query: `?search=Dushanbe&pageNumber=1&pageSize=20`
- `GET /locations/:id` -> Single location
- `POST /locations` -> Body: `{ name: string, address?: string, latitude?: number, longitude?: number }`

### 8. Search History (`/search-history`)
- `GET /search-history` -> List of recent searches for current user
- `POST /search-history` -> Body: `{ query: string, targetUserId?: number }`
- `DELETE /search-history/:id` -> Delete single history item
- `DELETE /search-history` -> Clear all history

---

## 💡 Code Sample: Recommended API Client (`frontend/src/lib/api.ts`)

```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await res.json();

  if (!res.ok || json.errors) {
    const message = Array.isArray(json.errors) && json.errors.length > 0
      ? json.errors.join(', ')
      : json.message || 'Request failed';
    throw new Error(message);
  }

  return json.data as T;
}
```

---

## 🎨 UI & UX Best Practices

1. **Instagram Look & Feel:**
   - Dark & Light mode support or sleek dark theme (`bg-black text-white` / `bg-neutral-900`).
   - Left Sidebar on Desktop (Logo, Home, Search, Explore, Reels, Messages, Notifications, Create, Profile).
   - Bottom Navigation Bar on Mobile screens (`< 768px`).
   - Clean card-based feed with square/portrait image carousels (`aspect-square` or `aspect-[4/5]`).
2. **Smooth Interactions:**
   - Double-tap on image to like with heart animation.
   - Optimistic UI for likes and comments (instant UI update before network finishes).
   - Skeleton loaders while fetching feeds and profiles.
3. **Responsive Breakpoints:**
   - Mobile: 360px - 767px (single column feed, bottom nav).
   - Tablet/Desktop: 768px - 1024px (left icon sidebar, centered feed).
   - Large Desktop: > 1024px (expanded sidebar with labels, right suggested users widget).
