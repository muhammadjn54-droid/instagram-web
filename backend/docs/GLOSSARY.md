# GLOSSARY — Instagram-like Social Network API

| Field | Value |
|---|---|
| Version | v0.1 |
| Date | 2026-10-21 |

| Term | Meaning | Table / field | Rules |
|---|---|---|---|
| **Post** | A permanent publication of one or more images with a title, a caption and an optional location. | `posts` + `post_images` | 1–10 images. Deleted only by its owner. |
| **Reel** | A post marked as a short vertical video. It is stored in the same table as a post. | `posts.isReel = true` | Listed by `GET /reels` (FR-047). |
| **Story** | A temporary image publication that lives 24 hours and then disappears. | `stories.expiresAt` | `expiresAt = createdAt + 24 h`. Only the owner can delete it early. |
| **Feed** | The list of posts published by the accounts the signed-in user follows, newest first. | computed query over `posts` + `follows` | Paged with `pageNumber` / `pageSize`. |
| **Favorite** | A post saved by a user into their private "saved" list. | `favorites` | Unique pair (`postId`, `userId`). Only the owner sees the list. |
| **Follow** | A directed link from one user to another: the follower sees the followed account in the feed. | `follows` | Unique pair (`followerId`, `followingId`). A user cannot follow themselves. |
| **Subscriber** | A user who follows the account. From the point of view of the followed account, that follower is a *subscriber*. The list of subscribers is the *followers* list. | `follows` where `followingId = :userId` | Endpoint `GET /users/{userId}/followers`. |
| **Subscription** | A link that the signed-in user has created to another account, i.e. one of the accounts that the user follows. The list of subscriptions is the *following* list. | `follows` where `followerId = :userId` | Endpoint `GET /users/{userId}/following`. |
| **Chat** | A private conversation between exactly two users. It holds messages. | `chats` | `user1Id` is always the smaller of the two ids. One chat per pair. |
| **Message** | One text or file entry inside a chat, written by one of the two chat members. | `messages` | Only the sender can delete it. `isRead` marks it as read. |
| **View** | A record that a user opened a post or a story. It is used for counters. | `post_views`, `story_views` | Unique pair per (item, user). Writing it twice does not create a second row. |
| **Like** | A reaction of a user to a post or to a story. | `post_likes`, `story_likes` | Unique pair per (item, user). It can be removed. |
| **Profile** | The extra data of a user: bio, avatar, website, gender, private flag. | `profiles` | One profile per user (`profiles.userId` is unique). |
| **Location** | A place that can be attached to a post: name, city, state, country, zip code. | `locations` | Deleting a location sets `posts.locationId` to NULL. |
| **Search history** | The list of queries the user typed, used to re-run them later. | `search_history` | Rows hold either `text` or `searchedUserId`. |
| **Comment** | A text written by a user under a post. | `comments` | 1–500 characters. Only the author can delete it. |
| **Access token** | A short-lived JWT that proves who the caller is. | JWT `sub`, `userName`, `email` | 15 minutes. Sent as `Authorization: Bearer <token>`. |
| **Refresh token** | A long-lived token used to get a new access token. | `users.refreshToken` | 7 days. Field exists, no endpoint yet (FR-002). |
| **Account** | The combination of a login (`userName`, `email`, `password`) and a profile. | `users` + `profiles` | `userName` and `email` are unique. |
| **Guest** | A visitor without a token. | — | Can only register, log in and reset a password. |
| **User** | A signed-in account. | — | Can do everything inside their own data. |
| **Admin** | A moderator account. | no column today — see `Q-01` | Can delete any content. Planned, not in the MVP. |
| **Paged result** | The wrapper of a list response. | `PagedResult<T>` | `{items, totalCount, pageNumber, pageSize, totalPages}`. |
| **API response** | The wrapper of every response of the API. | `ApiResponse<T>` | `{statusCode, data, errors}`. `data` is null on errors, `errors` is null on success. |
