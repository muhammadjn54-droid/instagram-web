'use client';

import { Compass } from 'lucide-react';

import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { PostGrid } from './PostGrid';
import { usePageParam } from '@/components/shared/usePageParam';
import { useGetPostsQuery } from '@/features/posts/postsApi';

/**
 * Explore — all publications of the platform.
 */
export function ExploreView() {
  const [page, setPage] = usePageParam();
  const { data, isLoading, isError, error, refetch } = useGetPostsQuery({
    pageNumber: page,
    pageSize: 18,
  });

  if (isLoading) {
    return <LoadingState label="Загружаем публикации…" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Не удалось загрузить публикации"
        message={error?.message}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[64rem] space-y-4 px-4 py-6">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Интересное</h1>

      <PostGrid
        posts={data?.items ?? []}
        emptyState={
          <EmptyState
            icon={<Compass className="h-6 w-6" aria-hidden="true" />}
            title="Пока нет публикаций"
            description="Как только появятся публикации, они отобразятся здесь."
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
