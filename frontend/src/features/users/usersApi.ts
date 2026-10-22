import { igApi } from '@/store/api/baseApi';
import { API_ROUTES } from '@/lib/api/endpoints';
import type { FollowUser, PagedResult, PaginationQuery, UserDetail, UserListItem } from '@/types';

export interface UserSearchQuery extends PaginationQuery {
  search?: string;
}

const usersApi = igApi.injectEndpoints({
  endpoints: (builder) => ({
    searchUsers: builder.query<PagedResult<UserListItem>, UserSearchQuery>({
      query: (params) => ({
        url: API_ROUTES.users.list,
        params: {
          pageNumber: params.pageNumber ?? 1,
          pageSize: params.pageSize ?? 20,
          ...(params.search ? { search: params.search } : {}),
        },
      }),
      providesTags: ['User'],
    }),

    getUser: builder.query<UserDetail, number>({
      query: (id) => ({ url: API_ROUTES.users.byId(id) }),
      providesTags: (result, _error, id) => [
        { type: 'User' as const, id },
        ...(result ? [{ type: 'Profile' as const, id: result.id }] : []),
      ],
    }),

    followUser: builder.mutation<string, number>({
      query: (userId) => ({ url: API_ROUTES.users.follow(userId), method: 'POST' }),
      invalidatesTags: (result, _error, userId) => [
        { type: 'User' as const, id: userId },
        { type: 'Profile' as const, id: userId },
        { type: 'Profile' as const, id: 'LIST' as const },
        { type: 'Post' as const, id: 'LIST' as const },
      ],
    }),

    unfollowUser: builder.mutation<string, number>({
      query: (userId) => ({ url: API_ROUTES.users.follow(userId), method: 'DELETE' }),
      invalidatesTags: (result, _error, userId) => [
        { type: 'User' as const, id: userId },
        { type: 'Profile' as const, id: userId },
        { type: 'Profile' as const, id: 'LIST' as const },
        { type: 'Post' as const, id: 'LIST' as const },
      ],
    }),

    getFollowers: builder.query<PagedResult<FollowUser>, { userId: number } & PaginationQuery>({
      query: ({ userId, pageNumber, pageSize }) => ({
        url: API_ROUTES.users.followers(userId),
        params: { pageNumber: pageNumber ?? 1, pageSize: pageSize ?? 20 },
      }),
      providesTags: (result, _error, { userId }) => [
        { type: 'User' as const, id: userId },
        ...(result
          ? result.items.map((user) => ({ type: 'User' as const, id: user.userId }))
          : []),
      ],
    }),

    getFollowing: builder.query<PagedResult<FollowUser>, { userId: number } & PaginationQuery>({
      query: ({ userId, pageNumber, pageSize }) => ({
        url: API_ROUTES.users.following(userId),
        params: { pageNumber: pageNumber ?? 1, pageSize: pageSize ?? 20 },
      }),
      providesTags: (result, _error, { userId }) => [
        { type: 'User' as const, id: userId },
        ...(result
          ? result.items.map((user) => ({ type: 'User' as const, id: user.userId }))
          : []),
      ],
    }),

    deleteAccount: builder.mutation<string, void>({
      query: () => ({ url: API_ROUTES.users.deleteMe, method: 'DELETE' }),
      invalidatesTags: ['Account'],
    }),
  }),
});

export const {
  useSearchUsersQuery,
  useGetUserQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useDeleteAccountMutation,
} = usersApi;
