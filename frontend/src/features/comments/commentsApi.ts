import { igApi } from '@/store/api/baseApi';
import { API_ROUTES } from '@/lib/api/endpoints';
import type { Comment, CreateCommentInput, PagedResult, PaginationQuery } from '@/types';

const commentsApi = igApi.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query<PagedResult<Comment>, { postId: number } & PaginationQuery>({
      query: ({ postId, pageNumber, pageSize }) => ({
        url: API_ROUTES.posts.comments(postId),
        params: { pageNumber: pageNumber ?? 1, pageSize: pageSize ?? 20 },
      }),
      providesTags: (result, _error, { postId }) => [
        { type: 'Comment' as const, id: `POST-${postId}` },
        ...(result
          ? result.items.map((comment) => ({ type: 'Comment' as const, id: comment.id }))
          : []),
      ],
    }),

    addComment: builder.mutation<Comment, { postId: number } & CreateCommentInput>({
      query: ({ postId, comment }) => ({
        url: API_ROUTES.posts.comments(postId),
        method: 'POST',
        body: { comment },
      }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'Comment' as const, id: `POST-${postId}` },
        { type: 'Post' as const, id: 'LIST' as const },
      ],
    }),

    deleteComment: builder.mutation<string, { commentId: number; postId: number }>({
      query: ({ commentId }) => ({
        url: API_ROUTES.comments.byId(commentId),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'Comment' as const, id: `POST-${postId}` },
        { type: 'Post' as const, id: 'LIST' as const },
      ],
    }),
  }),
});

export const { useGetCommentsQuery, useAddCommentMutation, useDeleteCommentMutation } =
  commentsApi;
