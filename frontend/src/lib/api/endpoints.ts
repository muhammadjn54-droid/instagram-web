/**
 * Single source of truth for backend routes.
 *
 * Every path below was verified against the NestJS controllers in
 * `backend/src/modules/**\/*.controller.ts`. Do not add a path here that the
 * backend does not serve.
 */
export const API_ROUTES = {
  account: {
    register: '/account/register',
    login: '/account/login',
    refreshToken: '/account/refresh-token',
    logout: '/account/logout',
    forgotPassword: '/account/forgot-password',
    resetPassword: '/account/reset-password',
    changePassword: '/account/change-password',
  },
  posts: {
    list: '/posts',
    feed: '/posts/feed',
    reels: '/posts/reels',
    mine: '/posts/me',
    create: '/posts',
    byId: (id: number) => `/posts/${id}`,
    like: (id: number) => `/posts/${id}/like`,
    view: (id: number) => `/posts/${id}/view`,
    favorite: (id: number) => `/posts/${id}/favorite`,
    comments: (postId: number) => `/posts/${postId}/comments`,
  },
  comments: {
    byId: (id: number) => `/comments/${id}`,
  },
  profiles: {
    me: '/profiles/me',
    favorites: '/profiles/me/favorites',
    updateMe: '/profiles/me',
    avatar: '/profiles/me/avatar',
    byId: (userId: number) => `/profiles/${userId}`,
  },
  users: {
    list: '/users',
    byId: (id: number) => `/users/${id}`,
    deleteMe: '/users/me',
    follow: (userId: number) => `/users/${userId}/follow`,
    followers: (userId: number) => `/users/${userId}/followers`,
    following: (userId: number) => `/users/${userId}/following`,
  },
  stories: {
    feed: '/stories',
    mine: '/stories/me',
    user: (userId: number) => `/stories/user/${userId}`,
    create: '/stories',
    byId: (id: number) => `/stories/${id}`,
    like: (id: number) => `/stories/${id}/like`,
    views: (id: number) => `/stories/${id}/views`,
    viewers: (id: number) => `/stories/${id}/viewers`,
  },
  chats: {
    list: '/chats',
    create: '/chats',
    byId: (chatId: number) => `/chats/${chatId}`,
    messages: (chatId: number) => `/chats/${chatId}/messages`,
    read: (chatId: number) => `/chats/${chatId}/read`,
    message: (chatId: number, messageId: number) =>
      `/chats/${chatId}/messages/${messageId}`,
  },
  locations: {
    list: '/locations',
    byId: (id: number) => `/locations/${id}`,
    create: '/locations',
  },
  searchHistory: {
    list: '/search-history',
    create: '/search-history',
    byId: (id: number) => `/search-history/${id}`,
    clear: '/search-history',
  },
} as const;

/**
 * Path prefix of the Next.js BFF proxy (`src/app/api/backend/[...path]/route.ts`).
 * Browser traffic never talks to NestJS directly — the proxy attaches the
 * bearer token that lives in an httpOnly cookie.
 */
export const API_PROXY_PREFIX = '/api/backend';
