'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';

import { ExploreGrid } from './ExploreGrid';
import { SearchPanel } from '@/components/search/SearchPanel';
import { useAddSearchHistoryMutation } from '@/features/search/searchApi';
import { useT } from '@/lib/i18n/LocaleProvider';

/**
 * Explore and search in one screen.
 *
 * The page starts as a grid of posts under a wide search bar. Focusing the bar
 * switches to search mode: a back arrow, a clear button and the recent
 * searches (or the results while typing). The back arrow returns to the grid.
 * `/search` opens the same screen with the search already active.
 */
export function ExploreView({ startInSearch = false }: { startInSearch?: boolean }) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searching, setSearching] = useState(startInSearch);
  const [query, setQuery] = useState('');
  const [addHistory] = useAddSearchHistoryMutation();

  useEffect(() => {
    if (startInSearch) inputRef.current?.focus();
  }, [startInSearch]);

  const leaveSearch = () => {
    setSearching(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const submitText = (event: React.FormEvent) => {
    event.preventDefault();

    const text = query.trim();
    if (text.length >= 2) {
      addHistory({ text })
        .unwrap()
        .catch(() => {
          // The history is a convenience: a failure must not break the search.
        });
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1406px] px-0 pb-6 pt-6 sm:px-4">
      <form
        onSubmit={submitText}
        role="search"
        className="mx-auto mb-6 flex max-w-[790px] items-center gap-3 px-4 sm:px-0"
      >
        {searching ? (
          <button
            type="button"
            onClick={leaveSearch}
            aria-label={t('Назад к рекомендациям')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-surface-muted"
          >
            <ArrowLeft className="h-6 w-6" aria-hidden="true" />
          </button>
        ) : null}

        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setSearching(true)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') leaveSearch();
            }}
            placeholder={t('Поиск')}
            aria-label={t('Поиск людей и мест')}
            className="h-12 w-full rounded-pill bg-surface-muted pl-14 pr-12 text-base text-foreground placeholder:text-subtle-foreground focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label={t('Очистить поиск')}
              className="absolute right-4 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-muted-foreground/60 text-surface hover:bg-muted-foreground"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </form>

      {searching ? (
        <div className="mx-auto max-w-[790px] px-2 sm:px-0">
          <SearchPanel query={query} onPickQuery={setQuery} />
        </div>
      ) : (
        <ExploreGrid />
      )}
    </div>
  );
}
