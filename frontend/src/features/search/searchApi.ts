import { igApi } from '@/store/api/baseApi';
import { API_ROUTES } from '@/lib/api/endpoints';
import type { CreateSearchHistoryInput, SearchHistoryItem } from '@/types';

const searchApi = igApi.injectEndpoints({
  endpoints: (builder) => ({
    getSearchHistory: builder.query<SearchHistoryItem[], void>({
      query: () => ({ url: API_ROUTES.searchHistory.list }),
      providesTags: ['SearchHistory'],
    }),

    addSearchHistory: builder.mutation<SearchHistoryItem, CreateSearchHistoryInput>({
      query: (body) => ({
        url: API_ROUTES.searchHistory.create,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SearchHistory'],
    }),

    deleteSearchHistory: builder.mutation<string, number>({
      query: (id) => ({ url: API_ROUTES.searchHistory.byId(id), method: 'DELETE' }),
      invalidatesTags: ['SearchHistory'],
    }),

    clearSearchHistory: builder.mutation<string, void>({
      query: () => ({ url: API_ROUTES.searchHistory.clear, method: 'DELETE' }),
      invalidatesTags: ['SearchHistory'],
    }),
  }),
});

export const {
  useGetSearchHistoryQuery,
  useAddSearchHistoryMutation,
  useDeleteSearchHistoryMutation,
  useClearSearchHistoryMutation,
} = searchApi;
