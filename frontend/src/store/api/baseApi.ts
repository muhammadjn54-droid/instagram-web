import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from '@/lib/api/axiosBaseQuery';

/**
 * Cache tags used across the whole application.
 *
 * Every tag maps to one backend resource so that a mutation can invalidate
 * exactly the surfaces it affects.
 */
export const TAG_TYPES = [
  'Account',
  'User',
  'Profile',
  'Post',
  'Comment',
  'Story',
  'Chat',
  'Message',
  'Location',
  'SearchHistory',
  'Notification',
] as const;

export type TagType = (typeof TAG_TYPES)[number];

/**
 * The single RTK Query API.
 *
 * Feature modules extend it with `injectEndpoints`, which keeps one store,
 * one cache and one tag graph while still allowing a folder per feature.
 */
export const igApi = createApi({
  reducerPath: 'igApi',
  baseQuery: axiosBaseQuery,
  tagTypes: [...TAG_TYPES],
  endpoints: () => ({}),
});

export const { invalidateTags } = igApi.util;
