'use client';

import { Bookmark } from 'lucide-react';

import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { PostGrid } from './PostGrid';
import { usePageParam } from '@/components/shared/usePageParam';
import { useGetFavoritesQuery } from '@/features/profiles/profilesApi';
import { useT } from '@/lib/i18n/LocaleProvider';

/**
 * Saved publications of the current user.
 */
export function SavedView() {
  const t = useT();
  const [page, setPage] = usePageParam();
  const { data, isLoading, isError, error, refetch } = useGetFavoritesQuery({
    pageNumber: page,
    pageSize: 18,
  });

  if (isLoading) {
    return <LoadingState label={t('Загружаем сохранённое…')} />;
  }

  if (isError) {
    return (
      <ErrorState
        title={t('Не удалось загрузить сохранённое')}
        message={error?.message}
        onRetry={refetch}
      />
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="mx-auto w-full max-w-[64rem] space-y-4 px-4 py-6">
      <h1 className="text-xl font-bold tracking-tight text-foreground">{t('Сохранённое')}</h1>

      <PostGrid
        posts={items}
        emptyState={
          <EmptyState
            icon={<Bookmark className="h-6 w-6" aria-hidden="true" />}
            title={t('Здесь пока пусто')}
            description={t('Сохраняйте публикации, чтобы вернуться к ним позже.')}
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
