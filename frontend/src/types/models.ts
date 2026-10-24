/**
 * Domain models.
 *
 * Every interface in this file mirrors a DTO that the NestJS backend actually
 * returns. The shapes were verified against the service implementations
 * (`backend/src/modules/**\/*.service.ts`), not only against the Swagger
 * annotations — in several places the two differ, and the service is the
 * runtime truth.
 *
 * IMPORTANT: the backend returns *flat* DTOs (`userName`, `userAvatar`,
 * `images: string[]`, …), not nested entities. Older versions of this file
 * described a nested shape that the API never produced; that was corrected.
 */
import type { PaginationQuery } from './api';

/* ------------------------------------------------------------------ account */

export interface AuthUser {
  id: number;
  userName: string;
  fullName: string;
  email: string;
  /** Path of the avatar on the backend, e.g. `/uploads/1234.jpg`. May be empty. */
  avatar: string;
}

/** `POST /account/login` and `POST /account/refresh-token`. */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  /** Access-token lifetime in seconds (86400 = 1 day). */
  expiresAt: number;
  user: AuthUser;
}

/** Shape stored in the httpOnly session cookie (decoded, never trusted for authorization). */
export interface SessionUser {
  id: number;
  userName: string;
  fullName: string;
  email: string;
  avatar: string;
  /** Unix timestamp (seconds) when the access token expires. */
  expiresAt: number;
}

export interface LoginInput {
  userName: string;
  password: string;
}

/** Payload returned by the Next.js session endpoints (`/api/session`). */
export interface SessionResponse {
  user: {
    id: number;
    userName: string;
    fullName: string;
    email: string;
    avatar: string;
  };
  /** Unix timestamp (seconds) of the access-token expiry. */
  expiresAt: number;
}

export interface RegisterInput {
  userName: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordInput {
  oldPassword: string;
  password: string;
  confirmPassword: string;
}

/* -------------------------------------------------------------------- post */

export interface PostLocation {
  id: number;
  name: string;
  city?: string;
  country?: string;
}

/** `PostDto` — returned by every `/posts` endpoint. */
export interface Post {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  title?: string;
  content: string;
  /** Ordered list of backend media paths, e.g. `['/uploads/a.jpg']`. */
  images: string[];
  location?: PostLocation;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  isLikedByMe: boolean;
  isFavoriteByMe: boolean;
  isReel: boolean;
  createdAt: string;
}

export interface PostQuery extends PaginationQuery {
  userId?: number;
  title?: string;
  isReel?: boolean;
}

export interface CreatePostInput {
  title?: string;
  content?: string;
  locationId?: number;
  isReel?: boolean;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  locationId?: number;
}

/* ----------------------------------------------------------------- profile */

export const Gender = {
  Male: 0,
  Female: 1,
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

/** `ProfileDetailDto` — `GET /profiles/me` and `GET /profiles/:userId`. */
export interface Profile {
  userId: number;
  userName: string;
  fullName: string;
  bio: string;
  avatar: string;
  website: string;
  gender: Gender;
  isPrivate: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
}

export interface UpdateProfileInput {
  fullName?: string;
  userName?: string;
  bio?: string;
  website?: string;
  gender?: Gender;
  isPrivate?: boolean;
}

/* ------------------------------------------------------------------- users */

export interface UserListItem {
  id: number;
  userName: string;
  fullName: string;
  avatar: string;
  followersCount: number;
  isFollowing: boolean;
}

export interface UserDetail {
  id: number;
  userName: string;
  fullName: string;
  email: string;
  bio: string;
  avatar: string;
  website: string;
  gender: number;
  isPrivate: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
  createdAt: string;
}

/** `FollowUserDto` — followers / following lists. */
export interface FollowUser {
  userId: number;
  userName: string;
  fullName: string;
  avatar: string;
  isFollowing: boolean;
}

/* ---------------------------------------------------------------- comments */

/** `CommentDto` — note the field is `content`, the request body field is `comment`. */
export interface Comment {
  id: number;
  postId: number;
  userId: number;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface CreateCommentInput {
  comment: string;
}

/* ----------------------------------------------------------------- stories */

export interface Story {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  imageUrl: string;
  postId?: number;
  likesCount: number;
  viewsCount: number;
  isLikedByMe: boolean;
  expiresAt: string;
  createdAt: string;
}

/** `UserStoriesGroupDto` — the story tray is grouped per author. */
export interface UserStoriesGroup {
  userId: number;
  userName: string;
  userAvatar: string;
  stories: Story[];
}

export interface StoryViewer {
  userId: number;
  userName: string;
  userAvatar: string;
  viewedAt: string;
}

/* ------------------------------------------------------------------- chats */

export interface ChatUser {
  id: number;
  userName: string;
  fullName: string;
  avatar: string;
}

export interface Message {
  id: number;
  chatId: number;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  text?: string;
  fileUrl?: string;
  isRead: boolean;
  createdAt: string;
}

/** `ChatListItemDto` — the conversation partner is `otherUser`, not `partner`. */
export interface Chat {
  id: number;
  otherUser: ChatUser;
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

/* --------------------------------------------------------------- locations */

export interface Location {
  id: number;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  createdAt: string;
}

/* ---------------------------------------------------------- search history */

export interface SearchHistoryItem {
  id: number;
  userId: number;
  text?: string;
  searchedUserId?: number;
  searchedUserName?: string;
  searchedUserAvatar?: string;
  createdAt: string;
}

export interface CreateSearchHistoryInput {
  text?: string;
  searchedUserId?: number;
}

/* ----------------------------------------------------------- notifications */

export type NotificationType = 'follow' | 'like' | 'comment' | 'story_like';

export interface NotificationActor {
  id: number;
  userName: string;
  fullName: string;
  avatar: string;
  /** The signed-in user follows this person. */
  isFollowing: boolean;
}

export interface Notification {
  /** Stable key, `<type>-<row id>`. */
  id: string;
  type: NotificationType;
  actor: NotificationActor;
  /** Comment text for `comment`. */
  text?: string;
  /** Post (or story) the event is about. */
  target?: { postId?: number; image?: string };
  createdAt: string;
}
