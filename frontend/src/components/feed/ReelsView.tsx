'use client';

import { Clapperboard } from 'lucide-react';

import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { PostGrid } from './PostGrid';
import { usePageParam } from '@/components/shared/usePageParam';
import { useGetReelsQuery } from '@/features/posts/postsApi';

/**
 * Reels — vertical publications.
 */
export function ReelsView() {
  const [page, setPage] = usePageParam();
  const { data, isLoading, isError, error, refetch } = useGetReelsQuery({
    pageNumber: page,
    pageSize: 12,
  });

  if (isLoading) {
    return <LoadingState label="Загружаем Reels…" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Не удалось загрузить Reels"
        message={error?.message}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[64rem] space-y-4 px-4 py-6">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Reels</h1>

      <PostGrid
        posts={data?.items ?? []}
        columns={2}
        emptyState={
          <EmptyState
            icon={<Clapperboard className="h-6 w-6" aria-hidden="true" />}
            title="Здесь пока нет Reels"
            description="Опубликуйте запись с галочкой «Опубликовать как Reels»."
          />
        }
      />

      {data ? (
        <Pagination
          page={data.pageNumber || page}
          totalPages={data.totalPages}
          totalCount={data.totalCount}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}
