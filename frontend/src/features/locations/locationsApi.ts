import { igApi } from '@/store/api/baseApi';
import { API_ROUTES } from '@/lib/api/endpoints';
import type { Location, PagedResult, PaginationQuery } from '@/types';

export interface LocationSearchQuery extends PaginationQuery {
  search?: string;
}

const locationsApi = igApi.injectEndpoints({
  endpoints: (builder) => ({
    getLocations: builder.query<PagedResult<Location>, LocationSearchQuery>({
      query: (params) => ({
        url: API_ROUTES.locations.list,
        params: {
          pageNumber: params.pageNumber ?? 1,
          pageSize: params.pageSize ?? 20,
          ...(params.search ? { search: params.search } : {}),
        },
      }),
      providesTags: ['Location'],
    }),

    getLocation: builder.query<Location, number>({
      query: (id) => ({ url: API_ROUTES.locations.byId(id) }),
      providesTags: (result, _error, id) => [{ type: 'Location' as const, id }],
    }),
  }),
});

export const { useGetLocationsQuery, useGetLocationQuery } = locationsApi;
