'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, MapPin, X } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { ErrorState, LoadingState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { useGetLocationsQuery } from '@/features/locations/locationsApi';
import {
  useAddSearchHistoryMutation,
  useClearSearchHistoryMutation,
  useDeleteSearchHistoryMutation,
  useGetSearchHistoryQuery,
} from '@/features/search/searchApi';
import { useSearchUsersQuery } from '@/features/users/usersApi';
import { formatCount } from '@/lib/utils';
import { useT } from '@/lib/i18n/LocaleProvider';

const DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 2;

const ROW =
  'flex items-center gap-4 rounded-xl px-4 py-2.5 transition-colors hover:bg-surface-muted';

/**
 * Content under the search bar: recent searches while it is empty, users and
 * places while the visitor types.
 */
export function SearchPanel({
  query,
  onPickQuery,
}: {
  query: string;
  /** Puts a text from the history back into the search field. */
  onPickQuery: (text: string) => void;
}) {
  const t = useT();
  const { toast } = useToast();
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  const history = useGetSearchHistoryQuery();
  const [addHistory] = useAddSearchHistoryMutation();
  const [deleteHistory] = useDeleteSearchHistoryMutation();
  const [clearHistory] = useClearSearchHistoryMutation();

  const hasQuery = debounced.length >= MIN_QUERY_LENGTH;
  const users = useSearchUsersQuery(
    { search: debounced, pageNumber: 1, pageSize: 20 },
    { skip: !hasQuery },
  );
  const locations = useGetLocationsQuery(
    { search: debounced, pageNumber: 1, pageSize: 10 },
    { skip: !hasQuery },
  );

  const remember = (text: string, userId?: number) => {
    addHistory({ text, searchedUserId: userId })
      .unwrap()
      .catch(() => {
        // The history is a convenience: a failure must not break the search.
      });
  };

  const handleClear = async () => {
    try {
      await clearHistory().unwrap();
    } catch {
      toast(t('Не удалось очистить историю'), 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteHistory(id).unwrap();
    } catch {
      toast(t('Не удалось удалить запись'), 'error');
    }
  };

  if (query.trim().length > 0) {
    if (!hasQuery) {
      return (
        <p className="py-16 text-center text-sm text-muted-foreground">
          {t('Введите минимум {count} символа.', { count: MIN_QUERY_LENGTH })}
        </p>
      );
    }

    const people = users.data?.items ?? [];
    const places = locations.data?.items ?? [];

    return (
      <div className="space-y-6">
        {users.isLoading ? (
          <LoadingState label={t('Ищем…')} />
        ) : users.isError ? (
          <ErrorState message={users.error?.message} onRetry={users.refetch} />
        ) : people.length === 0 && places.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">{t('Ничего не найдено.')}</p>
        ) : (
          <ul>
            {people.map((user) => (
              <li key={user.id}>
                <Link
                  href={`/profile/${user.id}`}
                  onClick={() => remember(user.userName, user.id)}
                  className={ROW}
                >
                  <Avatar src={user.avatar} name={user.fullName || user.userName} size="lg" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold text-foreground">
                      {user.userName}
                    </span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {user.fullName} · {t('{count} подписчиков', { count: formatCount(user.followersCount) })}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {places.length > 0 ? (
          <section>
            <h2 className="px-4 pb-2 text-sm font-bold text-foreground">{t('Места')}</h2>
            <ul>
              {places.map((place) => (
                <li key={place.id} className={ROW}>
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border">
                    <MapPin className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold text-foreground">
                      {place.name}
                    </span>
                    {place.city ? (
                      <span className="block truncate text-sm text-muted-foreground">
                        {place.city}
                        {place.country ? `, ${place.country}` : ''}
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    );
  }

  // Newest first; one row per person even if they were opened several times.
  const seenUsers = new Set<number>();
  const recent = (history.data ?? []).filter((item) => {
    if (item.searchedUserId === undefined || item.searchedUserId === null) return true;
    if (seenUsers.has(item.searchedUserId)) return false;
    seenUsers.add(item.searchedUserId);
    return true;
  });

  return (
    <section>
      <div className="flex items-center justify-between px-4 pb-3">
        <h2 className="text-base font-bold text-foreground">{t('Недавнее')}</h2>
        {recent.length > 0 ? (
          <button
            type="button"
            onClick={handleClear}
            className="text-sm font-semibold text-accent hover:underline"
          >
            {t('Очистить всё')}
          </button>
        ) : null}
      </div>

      {history.isLoading ? (
        <LoadingState label={t('Загружаем историю…')} />
      ) : history.isError ? (
        <ErrorState message={history.error?.message} onRetry={history.refetch} />
      ) : recent.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">{t('Нет недавних запросов.')}</p>
      ) : (
        <ul>
          {recent.map((item) => {
            const isUser = item.searchedUserId !== undefined && item.searchedUserId !== null;

            return (
              <li key={item.id} className="flex items-center">
                {isUser ? (
                  <Link href={`/profile/${item.searchedUserId}`} className={`${ROW} flex-1`}>
                    <Avatar
                      src={item.searchedUserAvatar}
                      name={item.searchedUserName}
                      size="lg"
                    />
                    <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-foreground">
                      {item.searchedUserName}
                    </span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => onPickQuery(item.text ?? '')}
                    className={`${ROW} flex-1 text-left`}
                  >
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border">
                      <Clock className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-foreground">
                      {item.text}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  aria-label={t('Удалить из истории')}
                  className="mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
