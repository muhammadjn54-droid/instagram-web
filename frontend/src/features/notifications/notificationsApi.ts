import { igApi } from '@/store/api/baseApi';
import type { Notification } from '@/types';

const notificationsApi = igApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<Notification[], void>({
      query: () => ({ url: '/notifications' }),
      providesTags: ['Notification'],
    }),
  }),
});

export const { useGetNotificationsQuery } = notificationsApi;
