'use client';

import { Bookmark } from 'lucide-react';

import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { MediaImage } from '@/components/shared/MediaImage';
import { usePageParam } from '@/components/shared/usePageParam';
import { useGetFavoritesQuery } from '@/features/profiles/profilesApi';

/**
 * Saved publications of the current user.
 */
export function SavedView() {
  const [page, setPage] = usePageParam();
  const { data, isLoading, isError, error, refetch } = useGetFavoritesQuery({
    pageNumber: page,
    pageSize: 18,
  });

  if (isLoading) {
    return <LoadingState label="Загружаем сохранённое…" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Не удалось загрузить сохранённое"
        message={error?.message}
        onRetry={refetch}
      />
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="mx-auto w-full max-w-[64rem] space-y-4 px-4 py-6">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Сохранённое</h1>

      {items.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="h-6 w-6" aria-hidden="true" />}
          title="Здесь пока пусто"
          description="Сохраняйте публикации, чтобы вернуться к ним позже."
        />
      ) : (
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 sm:gap-2">
          {items.map((item) => (
            <MediaImage
              key={item.id}
              src={item.images?.[0]?.url}
              alt={item.title ?? item.content ?? 'Сохранённая публикация'}
              aspectClassName="aspect-square"
            />
          ))}
        </div>
      )}

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
