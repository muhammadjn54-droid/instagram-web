'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { History, MapPin, Search, Trash2, UserRound, X } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { TimeAgo } from '@/components/shared/TimeAgo';
import { useToast } from '@/components/ui/Toast';
import { useGetLocationsQuery } from '@/features/locations/locationsApi';
import {
  useAddSearchHistoryMutation,
  useClearSearchHistoryMutation,
  useDeleteSearchHistoryMutation,
  useGetSearchHistoryQuery,
} from '@/features/search/searchApi';
import { useSearchUsersQuery } from '@/features/users/usersApi';

const DEBOUNCE_MS = 350;

/**
 * Global search: users, locations and the search history.
 */
export function SearchView() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  const history = useGetSearchHistoryQuery();
  const [addHistory] = useAddSearchHistoryMutation();
  const [deleteHistory] = useDeleteSearchHistoryMutation();
  const [clearHistory] = useClearSearchHistoryMutation();

  const users = useSearchUsersQuery(
    { search: debounced, pageNumber: 1, pageSize: 20 },
    { skip: debounced.trim().length < 2 },
  );

  const locations = useGetLocationsQuery(
    { search: debounced, pageNumber: 1, pageSize: 10 },
    { skip: debounced.trim().length < 2 },
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  const remember = (text: string, userId?: number) => {
    addHistory({ text, searchedUserId: userId }).unwrap().catch(() => {
      // The history is a convenience feature — a failure must not break the search.
    });
  };

  const handleClear = async () => {
    try {
      await clearHistory().unwrap();
    } catch {
      toast('Не удалось очистить историю', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteHistory(id).unwrap();
    } catch {
      toast('Не удалось удалить запись', 'error');
    }
  };

  const hasQuery = debounced.trim().length >= 2;

  return (
    <div className="mx-auto w-full max-w-[40rem] space-y-6 px-4 py-6">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск по имени пользователя или месту"
          aria-label="Поиск"
          className="w-full rounded-pill border border-border bg-surface py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-subtle-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Очистить поиск"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {hasQuery ? (
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-foreground">Пользователи</h2>

            {users.isLoading ? (
              <LoadingState label="Ищем пользователей…" />
            ) : users.isError ? (
              <ErrorState message={users.error?.message} onRetry={users.refetch} />
            ) : (users.data?.items.length ?? 0) === 0 ? (
              <EmptyState
                icon={<UserRound className="h-6 w-6" aria-hidden="true" />}
                title="Никого не найдено"
                description="Попробуйте изменить запрос."
                className="py-10"
              />
            ) : (
              <ul className="divide-y divide-border overflow-hidden rounded-card border border-border">
                {users.data?.items.map((user) => (
                  <li key={user.id}>
                    <Link
                      href={`/profile/${user.id}`}
                      onClick={() => remember(user.userName, user.id)}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-muted"
                    >
                      <Avatar src={user.avatar} name={user.fullName || user.userName} size="md" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {user.fullName || user.userName}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          @{user.userName}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {(locations.data?.items.length ?? 0) > 0 ? (
            <section className="space-y-3">
              <h2 className="text-sm font-bold text-foreground">Места</h2>
              <ul className="divide-y divide-border overflow-hidden rounded-card border border-border">
                {locations.data?.items.map((location) => (
                  <li
                    key={location.id}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-foreground"
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">{location.name}</span>
                    {location.city ? (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {location.city}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Недавние</h2>

            {(history.data?.length ?? 0) > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                icon={<Trash2 className="h-3.5 w-3.5" />}
              >
                Очистить
              </Button>
            ) : null}
          </div>

          {history.isLoading ? (
            <LoadingState label="Загружаем историю…" />
          ) : history.isError ? (
            <ErrorState message={history.error?.message} onRetry={history.refetch} />
          ) : (history.data?.length ?? 0) === 0 ? (
            <EmptyState
              icon={<History className="h-6 w-6" aria-hidden="true" />}
              title="История пуста"
              description="Здесь появятся ваши последние запросы."
              className="py-10"
            />
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-card border border-border">
              {history.data?.map((item) => (
                <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <History
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />

                  <button
                    type="button"
                    onClick={() => setQuery(item.text ?? item.searchedUserName ?? '')}
                    className="min-w-0 flex-1 truncate text-left text-sm text-foreground hover:underline"
                  >
                    {item.text || item.searchedUserName}
                  </button>

                  <TimeAgo
                    value={item.createdAt}
                    className="shrink-0 text-[10px] text-muted-foreground"
                  />

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    aria-label="Удалить из истории"
                    className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
