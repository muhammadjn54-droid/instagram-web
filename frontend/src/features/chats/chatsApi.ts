import { igApi } from '@/store/api/baseApi';
import { API_ROUTES } from '@/lib/api/endpoints';
import type { Chat, Message, PagedResult, PaginationQuery } from '@/types';

export interface SendMessagePayload {
  chatId: number;
  text?: string;
  file?: File;
}

const chatsApi = igApi.injectEndpoints({
  endpoints: (builder) => ({
    getChats: builder.query<Chat[], void>({
      query: () => ({ url: API_ROUTES.chats.list }),
      providesTags: ['Chat'],
    }),

    getChat: builder.query<Chat, number>({
      query: (chatId) => ({ url: API_ROUTES.chats.byId(chatId) }),
      providesTags: (result, _error, chatId) => [{ type: 'Chat' as const, id: chatId }],
    }),

    getOrCreateChat: builder.mutation<Chat, number>({
      query: (receiverUserId) => ({
        url: API_ROUTES.chats.create,
        method: 'POST',
        body: { receiverUserId },
      }),
      invalidatesTags: ['Chat'],
    }),

    getMessages: builder.query<PagedResult<Message>, { chatId: number } & PaginationQuery>({
      query: ({ chatId, pageNumber, pageSize }) => ({
        url: API_ROUTES.chats.messages(chatId),
        params: { pageNumber: pageNumber ?? 1, pageSize: pageSize ?? 30 },
      }),
      providesTags: (result, _error, { chatId }) => [
        { type: 'Message' as const, id: `CHAT-${chatId}` },
        ...(result
          ? result.items.map((message) => ({ type: 'Message' as const, id: message.id }))
          : []),
      ],
    }),

    sendMessage: builder.mutation<Message, SendMessagePayload>({
      query: ({ chatId, text, file }) => {
        if (file) {
          const formData = new FormData();
          if (text) formData.append('text', text);
          formData.append('file', file, file.name);

          return {
            url: API_ROUTES.chats.messages(chatId),
            method: 'POST',
            body: formData,
          };
        }

        return {
          url: API_ROUTES.chats.messages(chatId),
          method: 'POST',
          body: { text: text ?? '' },
        };
      },
      invalidatesTags: (_result, _error, { chatId }) => [
        { type: 'Message' as const, id: `CHAT-${chatId}` },
        'Chat',
      ],
    }),

    markChatRead: builder.mutation<string, number>({
      query: (chatId) => ({ url: API_ROUTES.chats.read(chatId), method: 'PATCH' }),
      invalidatesTags: ['Chat'],
    }),

    deleteMessage: builder.mutation<string, { chatId: number; messageId: number }>({
      query: ({ chatId, messageId }) => ({
        url: API_ROUTES.chats.message(chatId, messageId),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { chatId }) => [
        { type: 'Message' as const, id: `CHAT-${chatId}` },
      ],
    }),

    deleteChat: builder.mutation<string, number>({
      query: (chatId) => ({ url: API_ROUTES.chats.byId(chatId), method: 'DELETE' }),
      invalidatesTags: ['Chat', 'Message'],
    }),
  }),
});

export const {
  useGetChatsQuery,
  useGetChatQuery,
  useGetOrCreateChatMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkChatReadMutation,
  useDeleteMessageMutation,
  useDeleteChatMutation,
} = chatsApi;
