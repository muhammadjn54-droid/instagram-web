'use client';

import { Compass } from 'lucide-react';

import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { StoriesTray } from './StoriesTray';
import { PostCard } from './PostCard';
import { FeedSuggestions } from './FeedSuggestions';
import { FloatingMessagesButton } from './FloatingMessagesButton';
import { usePageParam } from '@/components/shared/usePageParam';
import { useGetFeedQuery } from '@/features/posts/postsApi';
import { useT } from '@/lib/i18n/LocaleProvider';

const PAGE_SIZE = 10;

/**
 * Main feed.
 */
export function FeedView() {
  const t = useT();
  const [page, setPage] = usePageParam();
  const { data, isLoading, isError, error, refetch, isFetching } = useGetFeedQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
  });

  if (isLoading) {
    return <LoadingState label={t('Загружаем ленту…')} />;
  }

  if (isError) {
    return (
      <ErrorState
        title={t('Не удалось загрузить ленту')}
        message={error?.message}
        onRetry={refetch}
      />
    );
  }

  const posts = data?.items ?? [];

  return (
    <div className="mx-auto flex justify-center gap-12 xl:gap-16 px-2 sm:px-4 py-4 max-w-[1024px]">
      {/* Left column: Stories + Feed posts */}
      <div className="w-full max-w-[630px] space-y-5">
        <StoriesTray />

        {posts.length === 0 ? (
          <EmptyState
            icon={<Compass className="h-6 w-6" aria-hidden="true" />}
            title={t('Пока здесь ничего нет')}
            description={t('Подпишитесь на других пользователей, чтобы видеть их публикации в ленте.')}
          />
        ) : (
          <div className={isFetching ? 'opacity-60 transition-opacity' : undefined}>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} className="mb-6" />
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

      {/* Right column: Current profile + Suggestions + Footer */}
      <FeedSuggestions />

      {/* Floating messages pill button */}
      <FloatingMessagesButton />
    </div>
  );
}
