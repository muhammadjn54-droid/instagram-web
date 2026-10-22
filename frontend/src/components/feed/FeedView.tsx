'use client';

import { Compass } from 'lucide-react';

import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { StoriesTray } from './StoriesTray';
import { PostCard } from './PostCard';
import { usePageParam } from '@/components/shared/usePageParam';
import { useGetFeedQuery } from '@/features/posts/postsApi';

const PAGE_SIZE = 10;

/**
 * Main feed.
 */
export function FeedView() {
  const [page, setPage] = usePageParam();
  const { data, isLoading, isError, error, refetch, isFetching } = useGetFeedQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
  });

  if (isLoading) {
    return <LoadingState label="Загружаем ленту…" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Не удалось загрузить ленту"
        message={error?.message}
        onRetry={refetch}
      />
    );
  }

  const posts = data?.items ?? [];

  return (
    <div className="mx-auto w-full max-w-[47rem] space-y-4 px-4 py-4">
      <StoriesTray />

      {posts.length === 0 ? (
        <EmptyState
          icon={<Compass className="h-6 w-6" aria-hidden="true" />}
          title="Пока здесь ничего нет"
          description="Подпишитесь на других пользователей, чтобы видеть их публикации в ленте."
        />
      ) : (
        <div className={isFetching ? 'opacity-60 transition-opacity' : undefined}>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} className="mb-4" />
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
