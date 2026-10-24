'use client';

import { useEffect, useState } from 'react';

import { useGetChatsQuery } from '@/features/chats/chatsApi';
import { useGetMyProfileQuery } from '@/features/profiles/profilesApi';
import { useSearchUsersQuery } from '@/features/users/usersApi';

export interface Recipient {
  id: number;
  userName: string;
  fullName: string;
  avatar: string;
}

const DEBOUNCE_MS = 300;

/**
 * People a message can be sent to.
 *
 * Without a query: the people the user already chats with. With a query of at
 * least two characters: a user search. The signed-in user is never listed.
 */
export function useRecipients(query: string) {
  const { data: me } = useGetMyProfileQuery();
  const chats = useGetChatsQuery();

  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  const searching = debounced.length >= 2;
  const search = useSearchUsersQuery(
    { search: debounced, pageNumber: 1, pageSize: 20 },
    { skip: !searching },
  );

  const recipients: Recipient[] = searching
    ? (search.data?.items ?? []).map((user) => ({
        id: user.id,
        userName: user.userName,
        fullName: user.fullName,
        avatar: user.avatar,
      }))
    : (chats.data ?? [])
        .filter((chat) => chat.otherUser)
        .map((chat) => ({
          id: chat.otherUser.id,
          userName: chat.otherUser.userName,
          fullName: chat.otherUser.fullName,
          avatar: chat.otherUser.avatar,
        }));

  return {
    recipients: recipients.filter((recipient) => recipient.id !== me?.userId),
    isLoading: searching ? search.isLoading || search.isFetching : chats.isLoading,
    searching,
  };
}
