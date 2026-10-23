'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Compass } from 'lucide-react';

import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { useGetPostsQuery } from '@/features/posts/postsApi';
import { PostTile } from './PostTile';
import { useT } from '@/lib/i18n/LocaleProvider';

const PAGE_SIZE = 24;

export interface ExploreGridProps {
  /** Only the posts of this user (profile page). */
  userId?: number;
  /** `true` = only reels, `false` = only photos, omitted = everything. */
  isReel?: boolean;
  /** Shown when there is nothing to list. */
  emptyState?: ReactNode;
}

/**
 * Grid of 3:4 post tiles that loads more while the user scrolls. Used by
 * Explore (every post) and by profiles (the posts of one user).
 *
 * Change the filters together with a new React `key` so the grid starts over.
 */
export function ExploreGrid({ userId, isReel, emptyState }: ExploreGridProps) {
  const t = useT();
  const first = useGetPostsQuery({ pageNumber: 1, pageSize: PAGE_SIZE, userId, isReel });

  const [pageCount, setPageCount] = useState(1);
  const [loadedPages, setLoadedPages] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const totalPages = first.data?.totalPages ?? 1;
  // The next page is requested only after the previous one arrived.
  const ready = Boolean(first.data) && loadedPages >= pageCount;

  const handleLoaded = useCallback((page: number) => {
    setLoadedPages((current) => Math.max(current, page));
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !ready || pageCount >= totalPages) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setPageCount((current) => current + 1);
        }
      },
      { rootMargin: '700px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [ready, pageCount, totalPages]);

  if (first.isLoading) {
    return <LoadingState label={t('Загружаем публикации…')} />;
  }

  if (first.isError) {
    return (
      <ErrorState
        title={t('Не удалось загрузить публикации')}
        message={first.error?.message}
        onRetry={first.refetch}
      />
    );
  }

  const items = first.data?.items ?? [];

  if (items.length === 0) {
    return (
      <>
        {emptyState ?? (
          <EmptyState
            icon={<Compass className="h-6 w-6" aria-hidden="true" />}
            title={t('Пока нет публикаций')}
            description={t('Как только появятся публикации, они отобразятся здесь.')}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-px sm:grid-cols-3 xl:grid-cols-4">
        {items.map((post) => (
          <PostTile key={post.id} post={post} />
        ))}

        {Array.from({ length: pageCount - 1 }, (_, index) => (
          <ExploreChunk
            key={index + 2}
            page={index + 2}
            userId={userId}
            isReel={isReel}
            onLoaded={handleLoaded}
          />
        ))}
      </div>

      <div ref={sentinelRef} aria-hidden="true" className="h-10" />
    </>
  );
}

function ExploreChunk({
  page,
  userId,
  isReel,
  onLoaded,
}: {
  page: number;
  userId?: number;
  isReel?: boolean;
  onLoaded: (page: number) => void;
}) {
  const { data } = useGetPostsQuery({ pageNumber: page, pageSize: PAGE_SIZE, userId, isReel });

  useEffect(() => {
    if (data) onLoaded(page);
  }, [data, page, onLoaded]);

  return (
    <>
      {(data?.items ?? []).map((post) => (
        <PostTile key={post.id} post={post} />
      ))}
    </>
  );
}
