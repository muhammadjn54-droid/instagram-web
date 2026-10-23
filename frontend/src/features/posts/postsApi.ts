import { igApi } from '@/store/api/baseApi';
import { API_ROUTES } from '@/lib/api/endpoints';
import type {
  CreatePostInput,
  PagedResult,
  PaginationQuery,
  Post,
  PostQuery,
  UpdatePostInput,
} from '@/types';

export interface CreatePostPayload extends CreatePostInput {
  files: File[];
}

export interface CreatePostPayloadRaw extends CreatePostInput {
  images: File[];
}

const postsApi = igApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeed: builder.query<PagedResult<Post>, PaginationQuery>({
      query: (params) => ({
        url: API_ROUTES.posts.feed,
        params: { pageNumber: params.pageNumber ?? 1, pageSize: params.pageSize ?? 10 },
      }),
      providesTags: (result) => [
        { type: 'Post' as const, id: 'LIST' as const },
        ...(result?.items ?? []).map((item) => ({ type: 'Post' as const, id: item.id })),
      ],
    }),

    getPosts: builder.query<PagedResult<Post>, PostQuery>({
      query: (params) => ({
        url: API_ROUTES.posts.list,
        params: {
          pageNumber: params.pageNumber ?? 1,
          pageSize: params.pageSize ?? 12,
          ...(params.userId ? { userId: params.userId } : {}),
          ...(params.title ? { title: params.title } : {}),
          ...(params.isReel !== undefined ? { isReel: params.isReel } : {}),
        },
      }),
      providesTags: (result) => [
        { type: 'Post' as const, id: 'LIST' as const },
        ...(result?.items ?? []).map((item) => ({ type: 'Post' as const, id: item.id })),
      ],
    }),

    getReels: builder.query<PagedResult<Post>, PaginationQuery>({
      query: (params) => ({
        url: API_ROUTES.posts.reels,
        params: { pageNumber: params.pageNumber ?? 1, pageSize: params.pageSize ?? 10 },
      }),
      providesTags: (result) => [
        { type: 'Post' as const, id: 'LIST' as const },
        ...(result?.items ?? []).map((item) => ({ type: 'Post' as const, id: item.id })),
      ],
    }),

    getMyPosts: builder.query<PagedResult<Post>, PaginationQuery>({
      query: (params) => ({
        url: API_ROUTES.posts.mine,
        params: { pageNumber: params.pageNumber ?? 1, pageSize: params.pageSize ?? 12 },
      }),
      providesTags: (result) => [
        { type: 'Post' as const, id: 'LIST' as const },
        ...(result?.items ?? []).map((item) => ({ type: 'Post' as const, id: item.id })),
      ],
    }),

    getPost: builder.query<Post, number>({
      query: (id) => ({ url: API_ROUTES.posts.byId(id) }),
      providesTags: (result, _error, id) => [
        { type: 'Post' as const, id },
        ...(result ? [{ type: 'Post' as const, id: 'LIST' as const }] : []),
      ],
    }),

    createPost: builder.mutation<Post, CreatePostPayload>({
      query: (payload) => {
        const formData = new FormData();
        payload.files.forEach((file) => formData.append('images', file, file.name));
        if (payload.title) formData.append('title', payload.title);
        if (payload.content) formData.append('content', payload.content);
        if (payload.locationId) formData.append('locationId', String(payload.locationId));
        if (payload.isReel) formData.append('isReel', 'true');

        return {
          url: API_ROUTES.posts.create,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Post', 'Profile'],
    }),

    updatePost: builder.mutation<Post, { id: number } & UpdatePostInput>({
      query: ({ id, ...body }) => ({
        url: API_ROUTES.posts.byId(id),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, _error, { id }) => [
        { type: 'Post' as const, id },
        { type: 'Post' as const, id: 'LIST' as const },
      ],
    }),

    deletePost: builder.mutation<string, number>({
      query: (id) => ({ url: API_ROUTES.posts.byId(id), method: 'DELETE' }),
      invalidatesTags: ['Post', 'Profile'],
    }),

    likePost: builder.mutation<string, number>({
      query: (id) => ({ url: API_ROUTES.posts.like(id), method: 'POST' }),
      invalidatesTags: (result, _error, id) => [{ type: 'Post' as const, id }],
    }),

    unlikePost: builder.mutation<string, number>({
      query: (id) => ({ url: API_ROUTES.posts.like(id), method: 'DELETE' }),
      invalidatesTags: (result, _error, id) => [{ type: 'Post' as const, id }],
    }),

    recordPostView: builder.mutation<string, number>({
      query: (id) => ({ url: API_ROUTES.posts.view(id), method: 'POST' }),
    }),

    favoritePost: builder.mutation<string, number>({
      query: (id) => ({ url: API_ROUTES.posts.favorite(id), method: 'POST' }),
      invalidatesTags: (result, _error, id) => [
        { type: 'Post' as const, id },
        { type: 'Post' as const, id: 'LIST' as const },
      ],
    }),

    unfavoritePost: builder.mutation<string, number>({
      query: (id) => ({ url: API_ROUTES.posts.favorite(id), method: 'DELETE' }),
      invalidatesTags: (result, _error, id) => [
        { type: 'Post' as const, id },
        { type: 'Post' as const, id: 'LIST' as const },
      ],
    }),
  }),
});

export const {
  useGetFeedQuery,
  useGetPostsQuery,
  useGetReelsQuery,
  useGetMyPostsQuery,
  useGetPostQuery,
  useLazyGetPostQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useLikePostMutation,
  useUnlikePostMutation,
  useRecordPostViewMutation,
  useFavoritePostMutation,
  useUnfavoritePostMutation,
} = postsApi;
