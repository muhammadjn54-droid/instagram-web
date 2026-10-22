import { igApi } from '@/store/api/baseApi';
import { API_ROUTES } from '@/lib/api/endpoints';
import type { Story, StoryViewer, UserStoriesGroup } from '@/types';

const storiesApi = igApi.injectEndpoints({
  endpoints: (builder) => ({
    getStories: builder.query<UserStoriesGroup[], void>({
      query: () => ({ url: API_ROUTES.stories.feed }),
      providesTags: ['Story'],
    }),

    getMyStories: builder.query<Story[], void>({
      query: () => ({ url: API_ROUTES.stories.mine }),
      providesTags: ['Story'],
    }),

    getUserStories: builder.query<Story[], number>({
      query: (userId) => ({ url: API_ROUTES.stories.user(userId) }),
      providesTags: ['Story'],
    }),

    createStory: builder.mutation<Story, { file: File; postId?: number }>({
      query: ({ file, postId }) => {
        const formData = new FormData();
        formData.append('image', file, file.name);
        if (postId) formData.append('postId', String(postId));

        return { url: API_ROUTES.stories.create, method: 'POST', body: formData };
      },
      invalidatesTags: ['Story', 'Post'],
    }),

    deleteStory: builder.mutation<string, number>({
      query: (id) => ({ url: API_ROUTES.stories.byId(id), method: 'DELETE' }),
      invalidatesTags: ['Story'],
    }),

    likeStory: builder.mutation<string, number>({
      query: (id) => ({ url: API_ROUTES.stories.like(id), method: 'POST' }),
      invalidatesTags: ['Story'],
    }),

    unlikeStory: builder.mutation<string, number>({
      query: (id) => ({ url: API_ROUTES.stories.like(id), method: 'DELETE' }),
      invalidatesTags: ['Story'],
    }),

    recordStoryView: builder.mutation<string, number>({
      query: (id) => ({ url: API_ROUTES.stories.views(id), method: 'POST' }),
    }),

    getStoryViewers: builder.query<StoryViewer[], number>({
      query: (id) => ({ url: API_ROUTES.stories.viewers(id) }),
      providesTags: ['Story'],
    }),
  }),
});

export const {
  useGetStoriesQuery,
  useGetMyStoriesQuery,
  useGetUserStoriesQuery,
  useCreateStoryMutation,
  useDeleteStoryMutation,
  useLikeStoryMutation,
  useUnlikeStoryMutation,
  useRecordStoryViewMutation,
  useGetStoryViewersQuery,
} = storiesApi;
