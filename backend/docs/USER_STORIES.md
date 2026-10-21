# USER STORIES — Instagram-like Social Network API

| Field | Value |
|---|---|
| Version | v0.1 |
| Date | 2026-10-21 |
| Format | As a / I want / So that + Given / When / Then + Errors |

Legend: **P0** Must, **P1** Should. `FR-xxx` links to `docs/TZ.md` §5,
`UC-xxx` links to `docs/USE_CASES.md`. Endpoint names are the target REST names
from `API_CONTRACT.md`; legacy `/Account/*` names are marked LEGACY.

## Account

### US-001 · Register a new account · FR-001 · P0
**As a** guest **I want** to register **so that** I can sign in. **Given** a free email and a userName, **when** `POST /Account/register` (LEGACY) with matching passwords, **then** 200 and `data` = "User registered successfully". **Errors:** 400 passwords do not match; 400 user already exists.

### US-002 · Log in and get a token · FR-002 · P0
**As a** registered user **I want** to log in **so that** I can call protected endpoints. **Given** correct credentials, **when** `POST /Account/login` (LEGACY), **then** 200 and `data` holds a JWT. **Errors:** 400 invalid credentials.

### US-003 · Recover a forgotten password · FR-003 · P0
**As a** user who forgot the password **I want** to request a reset link **so that** I can sign in again. **Given** a registered email, **when** the forgot-password request is sent, **then** 200 and the server never leaks whether the email exists. **Errors:** 400 email missing or malformed.

### US-004 · Set a new password with the reset token · FR-004 · P0
**As a** user with a reset token **I want** to set a new password **so that** my old password stops working. **Given** a valid token, **when** the reset request is sent, **then** 200 and the old password no longer logs in. **Errors:** 400 token invalid or expired; 400 passwords do not match.

### US-005 · Change my password while signed in · FR-005 · P0
**As a** signed-in user **I want** to change my password **so that** I can rotate a leaked secret. **Given** a valid Bearer token, **when** the change-password request is sent, **then** 200 and other sessions are invalidated. **Errors:** 401 no token; 400 old password wrong.

## Users

### US-010 · Find people by name or email · FR-010 · P0
**As a** user **I want** to search people **so that** I can follow them. **Given** at least one page of users, **when** `GET /users?userName=&pageNumber=1&pageSize=10`, **then** 200 and `data.items` holds the matches. **Errors:** 400 pageSize above 100.

### US-011 · Open someone's profile · FR-011 · P1
**As a** user **I want** to read a user by id **so that** I can see their public data. **Given** an existing userId, **when** `GET /users/{userId}`, **then** 200 with userName, fullName and profile. **Errors:** 404 user not found.

### US-012 · Close my account · FR-012 · P1
**As a** user **I want** to delete my account **so that** my data is removed. **Given** a valid token, **when** `DELETE /users/{userId}` with my own id, **then** 200 and my posts, stories and chats are gone. **Errors:** 401 no token; 403 not the owner.

### US-013 · Delete my account as admin · FR-012 · P1
**As an** admin **I want** to delete any account **so that** abuse stops. **Given** an admin token, **when** `DELETE /users/{userId}`, **then** 200 even for another user. **Errors:** 401 no token; 403 role is not admin.

### US-015 · Read my own user record · FR-011 · P1
**As a** signed-in user **I want** to read my own user record **so that** the client can show my account. **Given** a valid token, **when** `GET /users/me`, **then** 200 with userName, fullName and email. **Errors:** 401 no token.

## Profiles

### US-020 · See my own profile · FR-020 · P0
**As a** signed-in user **I want** to open my profile **so that** I can check my data. **Given** a valid token, **when** `GET /profiles/me`, **then** 200 with bio, avatar, website, gender, isPrivate. **Errors:** 401 no token.

### US-021 · See another user's profile · FR-021 · P0
**As a** user **I want** to open a profile by id **so that** I can learn about the owner. **Given** a public profile, **when** `GET /profiles/{userId}`, **then** 200 with the profile and its post counters. **Errors:** 404 profile not found; 403 profile is private.

### US-022 · Edit my profile · FR-022 · P0
**As a** user **I want** to edit my profile **so that** it represents me. **Given** a valid token, **when** `PUT /profiles/{userId}` with my own id, **then** 200 and the fields are saved. **Errors:** 400 bio longer than 150; 403 not the owner.

### US-023 · Change my avatar · FR-023 · P0
**As a** user **I want** to upload a photo **so that** people recognize me. **Given** a jpg or png under 10 MB, **when** `PUT /profiles/{userId}/avatar` as multipart, **then** 200 and `avatar` holds the new url. **Errors:** 400 wrong mime type; 413 file too large.

### US-024 · See if I already follow someone · FR-024 · P1
**As a** user **I want** to know the follow state **so that** the button is right. **Given** a valid token, **when** `GET /profiles/{userId}/follow-state`, **then** 200 with `data.isFollowing` true or false. **Errors:** 401 no token; 404 user not found.

## Follows

### US-030 · Follow someone · FR-030 · P0
**As a** user **I want** to follow someone **so that** their posts reach my feed. **Given** a valid token and another userId, **when** `POST /follows` with `followingUserId`, **then** 200 and one follow row exists. **Errors:** 400 cannot follow yourself; 409 already following.

### US-031 · Unfollow someone · FR-031 · P0
**As a** user **I want** to unfollow **so that** their posts leave my feed. **Given** an existing follow, **when** `DELETE /follows/{followingUserId}`, **then** 200 and the follow row is deleted. **Errors:** 401 no token; 404 follow not found.

### US-032 · See who follows me · FR-032 · P0
**As a** user **I want** to list my followers **so that** I know my audience. **Given** a userId, **when** `GET /users/{userId}/followers?pageNumber=1&pageSize=10`, **then** 200 with `data.items` of users. **Errors:** 404 user not found.

### US-033 · See who I follow · FR-033 · P0
**As a** user **I want** to list my subscriptions **so that** I can review them. **Given** a userId, **when** `GET /users/{userId}/following`, **then** 200 with a paged list. **Errors:** 404 user not found.

### US-034 · Feed only shows followed accounts · FR-048 · P0
**As a** user **I want** a feed of people I follow **so that** it stays relevant. **Given** I follow 2 accounts, **when** `GET /posts/feed`, **then** 200 and only their posts appear. **Errors:** 401 no token.

## Posts

### US-040 · Publish a photo post · FR-040 · P0
**As a** user **I want** to publish photos **so that** I share my life. **Given** 1–10 jpg images and a caption, **when** `POST /posts` as multipart, **then** 201 with the created post id. **Errors:** 400 no image; 400 caption longer than 2200; 413 file too large.

### US-041 · Open a post · FR-041 · P0
**As a** user **I want** to open a post **so that** I can read it. **Given** an existing postId, **when** `GET /posts/{postId}`, **then** 200 with images, counts and the author. **Errors:** 404 post not found.

### US-042 · Browse the posts of one user · FR-042 · P0
**As a** user **I want** to browse a user's posts **so that** I see their gallery. **Given** a userId, **when** `GET /posts?userId=&pageNumber=1&pageSize=12`, **then** 200 with a paged list. **Errors:** 400 pageSize above 100.

### US-043 · Like a post · FR-045 · P0
**As a** user **I want** to like a post **so that** the author sees it. **Given** a valid token, **when** `POST /posts/{postId}/likes`, **then** 200 and the like count grows by one. **Errors:** 401 no token; 404 post not found; 409 already liked.

### US-044 · Delete my post · FR-044 · P0
**As a** user **I want** to delete my post **so that** I can remove a mistake. **Given** I own the post, **when** `DELETE /posts/{postId}`, **then** 200 and the post, its comments and its likes are gone. **Errors:** 403 not the owner; 404 post not found.

## Comments

### US-050 · Comment on a post · FR-050 · P0
**As a** user **I want** to comment **so that** I can talk about a post. **Given** a valid token and text of 1–500 chars, **when** `POST /posts/{postId}/comments`, **then** 201 with the comment. **Errors:** 400 text empty or longer than 500; 404 post not found.

### US-051 · Read the comments of a post · FR-051 · P0
**As a** user **I want** to read comments **so that** I understand the discussion. **Given** a postId, **when** `GET /posts/{postId}/comments`, **then** 200 with a paged list and the total. **Errors:** 404 post not found.

### US-052 · Delete my comment · FR-052 · P0
**As a** user **I want** to delete my comment **so that** I can take it back. **Given** I wrote it, **when** `DELETE /comments/{commentId}`, **then** 200 and the comment is removed. **Errors:** 403 not the owner; 404 comment not found.

### US-053 · Comment on a deleted post · FR-050 · P0
**As a** user **I want** a clear answer when the post is gone **so that** I know it failed. **Given** a deleted postId, **when** I post a comment, **then** 404 and `errors` holds "Post not found". **Errors:** 404 post not found.

### US-054 · Comment twice · FR-050 · P0
**As a** user **I want** to comment several times **so that** I can add to the discussion. **Given** the same post, **when** I send a second comment, **then** 201 and both comments are listed. **Errors:** none.

## Favorites

### US-060 · Save a post · FR-060 · P0
**As a** user **I want** to save a post **so that** I find it later. **Given** a valid token, **when** `POST /favorites` with `postId`, **then** 200 and one favorite row exists. **Errors:** 404 post not found; 409 already saved.

### US-061 · Remove a saved post · FR-061 · P0
**As a** user **I want** to unsave a post **so that** my list is clean. **Given** a saved post, **when** `DELETE /favorites/{postId}`, **then** 200 and the row is deleted. **Errors:** 404 favorite not found.

### US-062 · Open my saved list · FR-062 · P0
**As a** user **I want** to see all saved posts **so that** I browse them. **Given** 3 favorites, **when** `GET /users/me/favorites`, **then** 200 with 3 items and `totalCount` = 3. **Errors:** 401 no token.

### US-063 · Favourite list is private · FR-062 · P0
**As a** user **I want** my saved list private **so that** nobody else sees it. **Given** another user's token, **when** they call `GET /users/me/favorites`, **then** they get their own list only. **Errors:** 401 no token.

### US-064 · Saving a deleted post · FR-060 · P0
**As a** user **I want** a clear error **so that** I do not save a ghost. **Given** a deleted postId, **when** I save it, **then** 404 and `errors` holds "Post not found". **Errors:** 404 post not found.

## Stories

### US-070 · Publish a story · FR-070 · P0
**As a** user **I want** to publish a story **so that** my friends see my day. **Given** one jpg under 10 MB, **when** `POST /stories` as multipart, **then** 201 with the story id and `expiresAt`. **Errors:** 400 no file; 413 file too large.

### US-071 · See stories of people I follow · FR-072 · P0
**As a** user **I want** to see stories of people I follow **so that** I catch up. **Given** a valid token, **when** `GET /stories`, **then** 200 with only stories younger than 24 h. **Errors:** 401 no token.

### US-072 · Open the stories of one user · FR-073 · P0
**As a** user **I want** to open a user's stories **so that** I watch them. **Given** a userId, **when** `GET /users/{userId}/stories`, **then** 200 with the active stories. **Errors:** 404 user not found.

### US-073 · My story disappears after 24 h · FR-071 · P0
**As a** user **I want** old stories to vanish **so that** my profile stays fresh. **Given** a story created 25 h ago, **when** I list stories, **then** it is not in the result. **Errors:** none.

### US-074 · Delete my story · FR-076 · P0
**As a** user **I want** to delete a story **so that** I can remove it early. **Given** I own it, **when** `DELETE /stories/{storyId}`, **then** 200 and it is gone. **Errors:** 403 not the owner; 404 story not found.

## Chats

### US-080 · Start a chat · FR-082 · P0
**As a** user **I want** to start a chat **so that** I can write to someone. **Given** a valid token and another userId, **when** `POST /chats` with `receiverUserId`, **then** 200 with the chat id. **Errors:** 400 cannot chat with yourself; 409 chat already exists.

### US-081 · Open my chat list · FR-080 · P0
**As a** user **I want** to see my chats **so that** I continue conversations. **Given** a valid token, **when** `GET /chats`, **then** 200 with my chats and the last message of each. **Errors:** 401 no token.

### US-082 · Send a message · FR-083 · P0
**As a** user **I want** to send a message **so that** I talk. **Given** a chat I am part of, **when** `PUT /chats/{chatId}/messages` with text, **then** 200 with the created message. **Errors:** 403 not a member of the chat; 404 chat not found.

### US-083 · Send a picture in a chat · FR-084 · P1
**As a** user **I want** to attach a file **so that** I share media. **Given** one file under 10 MB, **when** I send it as multipart, **then** 200 and `fileUrl` is set. **Errors:** 413 file too large; 400 wrong mime type.

### US-084 · Delete a message · FR-085 · P0
**As a** user **I want** to delete my message **so that** I can unsend it. **Given** I am the sender, **when** `DELETE /chats/{chatId}/messages/{messageId}`, **then** 200 and it is removed. **Errors:** 403 not the sender; 404 message not found.

## Locations

### US-090 · Browse locations · FR-090 · P1
**As a** user **I want** to browse locations **so that** I tag my post. **Given** filters, **when** `GET /locations?city=&country=&pageNumber=1&pageSize=10`, **then** 200 with a paged list. **Errors:** 400 pageSize above 100.

### US-091 · Read one location · FR-091 · P1
**As a** user **I want** to read a location **so that** I see its details. **Given** a locationId, **when** `GET /locations/{locationId}`, **then** 200 with name, city, state, country, zipCode. **Errors:** 404 location not found.

### US-092 · Add a location · FR-092 · P1
**As an** admin **I want** to add a location **so that** posts can use it. **Given** a valid admin token, **when** `POST /locations`, **then** 201 with the new id. **Errors:** 403 role is not admin; 400 name empty.

### US-093 · Update a location · FR-093 · P1
**As an** admin **I want** to fix a location **so that** data stays correct. **Given** a locationId, **when** `PUT /locations/{locationId}`, **then** 200 and the field is stored. **Errors:** 403 role is not admin; 404 location not found.

### US-094 · Delete a location · FR-094 · P1
**As an** admin **I want** to remove a location **so that** wrong places disappear. **Given** a location used by posts, **when** `DELETE /locations/{locationId}`, **then** 200 and the posts stay with `locationId = null`. **Errors:** 403 role is not admin; 404 location not found.

## Search history

### US-100 · My searches are remembered · FR-013 · P0
**As a** user **I want** my searches remembered **so that** I do not retype them. **Given** a valid token, **when** the client stores a text query, **then** a row appears in my history. **Errors:** 401 no token.

### US-101 · Search for a person and remember it · FR-014 · P1
**As a** user **I want** to search a person **so that** the search is saved. **Given** a userId, **when** the client stores the user search, **then** the history row links to that user. **Errors:** 404 user not found.

### US-102 · Read my search history · FR-015 · P0
**As a** user **I want** to read my history **so that** I can re-run a search. **Given** 5 saved searches, **when** `GET /search-histories`, **then** 200 with 5 items, newest first. **Errors:** 401 no token.

### US-103 · Delete one search · FR-015 · P1
**As a** user **I want** to delete one search **so that** my history is tidy. **Given** a history id, **when** `DELETE /search-histories/{id}`, **then** 200 and only that row is gone. **Errors:** 404 history entry not found.

### US-104 · Clear my search history · FR-015 · P1
**As a** user **I want** to clear the whole history **so that** nothing is kept. **Given** 5 rows, **when** `DELETE /search-histories`, **then** 200 and 0 rows remain. **Errors:** 401 no token.
