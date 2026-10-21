// Standard API Response Envelope
export interface ApiResponse<T> {
  statusCode: number;
  data: T | null;
  errors: string[] | null;
}

// Pagination wrapper
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// User model
export interface User {
  id: number;
  userName: string;
  fullName?: string;
  email: string;
  avatarUrl?: string | null;
  profile?: Profile;
}

// Profile model
export interface Profile {
  id: number;
  fullName?: string;
  bio?: string;
  website?: string;
  gender?: string;
  phone?: string;
  avatarUrl?: string | null;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

// Post image model
export interface PostImage {
  id: number;
  imageUrl: string;
  order: number;
}

// Location model
export interface Location {
  id: number;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

// Post model
export interface Post {
  id: number;
  title?: string;
  content?: string;
  isReel: boolean;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isFavorited?: boolean;
  createdAt: string;
  user: User;
  images: PostImage[];
  location?: Location | null;
}

// Comment model
export interface Comment {
  id: number;
  comment: string;
  createdAt: string;
  user: User;
}

// Story model
export interface Story {
  id: number;
  imageUrl: string;
  createdAt: string;
  expiresAt: string;
  viewsCount: number;
  likesCount: number;
  isLiked?: boolean;
  user?: User;
}

// Grouped stories by user for feed
export interface UserStoriesGroup {
  user: User;
  stories: Story[];
}

// Chat message model
export interface Message {
  id: number;
  text?: string;
  fileUrl?: string | null;
  isRead: boolean;
  createdAt: string;
  senderId: number;
  sender: User;
}

// Chat conversation model
export interface Chat {
  id: number;
  updatedAt: string;
  unreadCount?: number;
  lastMessage?: Message | null;
  partner?: User;
}

// Search history model
export interface SearchHistoryItem {
  id: number;
  query: string;
  createdAt: string;
  targetUser?: User | null;
}
