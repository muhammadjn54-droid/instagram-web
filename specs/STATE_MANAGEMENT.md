# State Management & Caching Strategy — Instagram Web Clone

> **Document Version:** 1.0  
> **Status:** Implementation guidelines for client and server state.

---

## 1. State Categorization

The application partitions state into three discrete tiers:

1. **Global Session & Auth State:**
   * User identity, JWT token, active theme.
   * Managed via `src/lib/auth.ts` and lightweight React Context / hooks.
2. **Server Cache & Data Fetching:**
   * Feed posts, user profiles, comments, stories, direct chat history.
   * Fetched via `apiRequest<T>` or RTK Query with cache tagging and invalidation.
3. **Local Component State:**
   * Form inputs, password visibility toggle, modal visibility, carousel active index, like animation triggers.
   * Managed via React `useState`, `useRef`, and `useReducer`.

---

## 2. Optimistic UI Updates

To match the instant responsiveness of the real Instagram app:
* **Like / Unlike:**
  * When user taps the heart icon, `isLiked` flips immediately and `likesCount` increments/decrements in UI instantly.
  * An asynchronous call (`POST /posts/:id/like` or `DELETE /posts/:id/like`) is dispatched in the background.
  * If the network fails, the state rolls back with a toast alert.
* **Bookmark / Save:**
  * Instantly toggles `isFavorited` in local state while dispatching network mutation.
* **Comments:**
  * Prepends the user's new comment to the comments list with a temporary ID while the server request is in flight.

---

## 3. Cache Invalidation Rules

* Creating a post (`POST /posts`) -> Prepends to Feed and invalidates User Profile post count.
* Following a user (`POST /users/:id/follow`) -> Invalidates Follower lists and updates Following counts.
* Reading a message (`PATCH /chats/:id/read`) -> Clears unread badge on chat item.
