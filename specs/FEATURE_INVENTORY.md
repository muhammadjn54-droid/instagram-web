# Feature Inventory & Acceptance Criteria — Instagram Web Clone

> **Document Version:** 1.0  
> **Repository:** `instagram-monorepo`  
> **Status:** Authoritative feature breakdown by functional module.

---

## 1. Feature Modules & Child Tasks

### Module 1: Authentication & Session Management (AUTH)
- **AUTH-01 [COMPLETE]:** Username/Email login UI with floating/styled inputs, password visibility toggle, and disabled state.
- **AUTH-02 [COMPLETE]:** "Войти с Email" alternative entry button.
- **AUTH-03 [COMPLETE]:** Quick-select testing buttons for pre-seeded accounts (`alex_photographer`, `maria_art`, `john_traveler`).
- **AUTH-04 [COMPLETE]:** Client-side validation: minimum password length, required fields, trim whitespace.
- **AUTH-05 [COMPLETE]:** Integration with `POST /account/login`, parsing `{ accessToken, user }`, saving JWT to `localStorage` and `cookie`.
- **AUTH-06 [COMPLETE]:** Registration form with 5 fields (email, fullName, userName, password, confirmPassword).
- **AUTH-07 [COMPLETE]:** Integration with `POST /account/register` with auto-login on successful registration.
- **AUTH-08 [COMPLETE]:** Password recovery request form with `POST /account/forgot-password`.
- **AUTH-09 [COMPLETE]:** Logout function (`clearAuth()`) clearing tokens and resetting user state.
- **AUTH-10 [NOT COMPLETE]:** Route Guard: Server/Client middleware redirecting unauthenticated visitors attempting to access `/direct`, `/explore`, or `/accounts/edit`.

### Module 2: Application Shell & Navigation (SHELL)
- **SHELL-01 [NOT COMPLETE]:** Left Sidebar component for Desktop screens (`> 1264px` wide, `768px-1264px` collapsed).
- **SHELL-02 [NOT COMPLETE]:** Sidebar links: Home, Search (trigger drawer), Explore, Reels, Messages, Create (trigger modal), Profile.
- **SHELL-03 [NOT COMPLETE]:** Mobile Bottom Navigation Bar (`< 768px`) with 5 primary icons.
- **SHELL-04 [NOT COMPLETE]:** Active route indicator (bold icon / active styling).
- **SHELL-05 [NOT COMPLETE]:** "More" menu popover with Logout and Settings links.

### Module 3: Home Feed & Social Interaction (FEED)
- **FEED-01 [NOT COMPLETE]:** Stories tray rendered at top of feed (`GET /stories`).
- **FEED-02 [PARTIAL]:** Feed post card layout with author avatar, username, location, and timestamp.
- **FEED-03 [NOT COMPLETE]:** Multi-image carousel with left/right arrows, swipe support, and dot pagination indicators.
- **FEED-04 [NOT COMPLETE]:** Double-tap on media triggers animated heart overlay.
- **FEED-05 [NOT COMPLETE]:** Like/Unlike button with optimistic UI count increment/decrement (`POST /posts/:id/like`, `DELETE /posts/:id/like`).
- **FEED-06 [NOT COMPLETE]:** Save/Bookmark button (`POST /posts/:id/favorite`, `DELETE /posts/:id/favorite`).
- **FEED-07 [NOT COMPLETE]:** View count registration on viewport visibility (`POST /posts/:id/view`).
- **FEED-08 [NOT COMPLETE]:** Collapsible caption ("ещё..." toggle).
- **FEED-09 [NOT COMPLETE]:** Inline quick comment submission (`POST /posts/:id/comments`).
- **FEED-10 [NOT COMPLETE]:** Infinite scroll pagination loading next page (`?pageNumber=2`).
- **FEED-11 [NOT COMPLETE]:** Empty feed fallback with suggested accounts to follow.

### Module 4: Post Creation Wizard (CREATE)
- **CREATE-01 [NOT COMPLETE]:** Create Post Modal dialog triggered from Sidebar/Bottom bar.
- **CREATE-02 [NOT COMPLETE]:** Drag & Drop file dropzone accepting 1–10 images (JPG, PNG, WEBP, max 5MB).
- **CREATE-03 [NOT COMPLETE]:** Image preview carousel with ability to remove or reorder images.
- **CREATE-04 [NOT COMPLETE]:** Caption textarea with character count indicator.
- **CREATE-05 [NOT COMPLETE]:** Location selector with debounced autocomplete (`GET /locations?search=`).
- **CREATE-06 [NOT COMPLETE]:** "Publish as Reel" checkbox (`isReel: true`).
- **CREATE-07 [NOT COMPLETE]:** Multipart FormData upload submission to `POST /posts` with progress bar.
- **CREATE-08 [NOT COMPLETE]:** Success callback prepending new post to feed and closing modal.

### Module 5: Post Details & Comments Modal (MODAL)
- **MODAL-01 [NOT COMPLETE]:** Two-column post modal (left media carousel, right author header, comments stream, action bar).
- **MODAL-02 [NOT COMPLETE]:** Paginated comments stream (`GET /posts/:id/comments`).
- **MODAL-03 [NOT COMPLETE]:** Delete comment button for comment author or post owner (`DELETE /comments/:id`).

### Module 6: Stories Bar & Fullscreen Viewer (STORY)
- **STORY-01 [NOT COMPLETE]:** Horizontal scrollable stories tray with unviewed gradient rings.
- **STORY-02 [NOT COMPLETE]:** Fullscreen Story Viewer modal.
- **STORY-03 [NOT COMPLETE]:** 5-second progress bar timer with auto-advance to next story.
- **STORY-04 [NOT COMPLETE]:** Tap left side to go back, tap right side to go forward, hold to pause.
- **STORY-05 [NOT COMPLETE]:** Story like button (`POST /stories/:id/like`).
- **STORY-06 [NOT COMPLETE]:** Record story view (`POST /stories/:id/views`).
- **STORY-07 [NOT COMPLETE]:** Author viewers drawer (`GET /stories/:id/viewers`).
- **STORY-08 [NOT COMPLETE]:** Upload new story wizard (`POST /stories` with `multipart/form-data: image`).

### Module 7: User Profiles & Follow Graph (PROFILE)
- **PROFILE-01 [PARTIAL]:** Profile header with avatar, bio, website link, and post/follower/following counts (`GET /profiles/me` or `GET /profiles/:id`).
- **PROFILE-02 [NOT COMPLETE]:** Avatar upload modal with instant image crop/preview (`PUT /profiles/me/avatar`).
- **PROFILE-03 [NOT COMPLETE]:** Follow/Unfollow toggle button on other user profiles (`POST /users/:id/follow`, `DELETE /users/:id/follow`).
- **PROFILE-04 [NOT COMPLETE]:** Followers and Following modal lists (`GET /users/:id/followers`, `GET /users/:id/following`).
- **PROFILE-05 [NOT COMPLETE]:** Profile 3-column publications grid (`GET /posts?userId=`).
- **PROFILE-06 [NOT COMPLETE]:** Saved posts tab for profile owner (`GET /profiles/me/favorites`).
- **PROFILE-07 [NOT COMPLETE]:** Edit profile settings form (`PATCH /profiles/me`).

### Module 8: Direct Messaging (CHATS)
- **CHAT-01 [NOT COMPLETE]:** Conversations list displaying partner avatar, username, last message, and unread badge (`GET /chats`).
- **CHAT-02 [NOT COMPLETE]:** New conversation modal dialog searching for users (`POST /chats`).
- **CHAT-03 [NOT COMPLETE]:** Message thread view with date dividers and outgoing/incoming bubble styling (`GET /chats/:id/messages`).
- **CHAT-04 [NOT COMPLETE]:** Send message via plain JSON `{ "text": "..." }` or multipart with file attachment (`POST /chats/:id/messages`).
- **CHAT-05 [NOT COMPLETE]:** Mark conversation as read on focus (`PATCH /chats/:id/read`).
- **CHAT-06 [NOT COMPLETE]:** Delete message (`DELETE /chats/:id/messages/:msgId`).

### Module 9: Search & Explore (SEARCH)
- **SEARCH-01 [NOT COMPLETE]:** Search drawer sliding out from sidebar with input field.
- **SEARCH-02 [NOT COMPLETE]:** Debounced user search (`GET /users?search=`).
- **SEARCH-03 [NOT COMPLETE]:** Recent search history list (`GET /search-history`, `POST /search-history`, `DELETE /search-history/:id`).
- **SEARCH-04 [NOT COMPLETE]:** Explore page responsive 3-column media grid (`GET /posts`).

### Module 10: Reels Short-Form Video (REELS)
- **REELS-01 [NOT COMPLETE]:** Vertical reels player with snap scrolling (`GET /posts/reels`).
- **REELS-02 [NOT COMPLETE]:** Play/pause toggle, mute/unmute audio control.
- **REELS-03 [NOT COMPLETE]:** Floating action bar on right (Like, Comment, Share).
