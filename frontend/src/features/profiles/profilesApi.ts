import { igApi } from '@/store/api/baseApi';
import { API_ROUTES } from '@/lib/api/endpoints';
import type { FavoritePost, PagedResult, PaginationQuery, Profile, UpdateProfileInput } from '@/types';

const profilesApi = igApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyProfile: builder.query<Profile, void>({
      query: () => ({ url: API_ROUTES.profiles.me }),
      providesTags: (result) => [
        { type: 'Profile' as const, id: result?.userId ?? 'ME' },
        { type: 'Profile' as const, id: 'LIST' as const },
      ],
    }),

    getProfile: builder.query<Profile, number>({
      query: (userId) => ({ url: API_ROUTES.profiles.byId(userId) }),
      providesTags: (result, _error, userId) => [
        { type: 'Profile' as const, id: userId },
        { type: 'Profile' as const, id: 'LIST' as const },
      ],
    }),

    updateProfile: builder.mutation<Profile, UpdateProfileInput>({
      query: (body) => ({
        url: API_ROUTES.profiles.updateMe,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Profile', 'User', 'Post'],
    }),

    updateAvatar: builder.mutation<string, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append('image', file, file.name);
        return { url: API_ROUTES.profiles.avatar, method: 'PUT', body: formData };
      },
      invalidatesTags: ['Profile', 'User', 'Account'],
    }),

    deleteAvatar: builder.mutation<string, void>({
      query: () => ({ url: API_ROUTES.profiles.avatar, method: 'DELETE' }),
      invalidatesTags: ['Profile', 'User', 'Account'],
    }),

    /**
     * The backend answers this endpoint with raw TypeORM entities instead of
     * `PostDto`, therefore the payload is typed as `FavoritePost`.
     */
    getFavorites: builder.query<PagedResult<FavoritePost>, PaginationQuery>({
      query: (params) => ({
        url: API_ROUTES.profiles.favorites,
        params: { pageNumber: params.pageNumber ?? 1, pageSize: params.pageSize ?? 12 },
      }),
      providesTags: ['Post'],
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
  useDeleteAvatarMutation,
  useGetFavoritesQuery,
} = profilesApi;
