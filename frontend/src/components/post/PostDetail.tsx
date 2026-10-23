'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Card, ErrorState, LoadingState } from '@/components/ui/States';
import { PageHeader } from '@/components/layout/PageHeader';
import { PostCard } from '@/components/feed/PostCard';
import { CommentSection } from './CommentSection';
import { useGetPostQuery, useRecordPostViewMutation } from '@/features/posts/postsApi';
import { useGetMyProfileQuery } from '@/features/profiles/profilesApi';
import { useT } from '@/lib/i18n/LocaleProvider';

/**
 * Single post page.
 *
 * The identifier comes from the router (`useParams`), therefore the page
 * needs no server-side data access.
 */
export function PostDetail() {
  const t = useT();
  const params = useParams<{ postId: string }>();
  const router = useRouter();
  const postId = Number(params?.postId);

  const { data: profile } = useGetMyProfileQuery();
  const [recordView] = useRecordPostViewMutation();

  const { data: post, isLoading, isError, error, refetch } = useGetPostQuery(postId, {
    skip: !Number.isFinite(postId),
  });

  useEffect(() => {
    if (!postId || !Number.isFinite(postId)) return;
    recordView(postId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the view is counted once per post
  }, [postId]);

  if (!Number.isFinite(postId)) {
    return (
      <ErrorState
        title={t('Некорректный адрес публикации')}
        message={t('Идентификатор публикации должен быть числом.')}
      />
    );
  }

  if (isLoading) {
    return <LoadingState label={t('Загружаем публикацию…')} />;
  }

  if (isError || !post) {
    return (
      <ErrorState
        title={t('Не удалось загрузить публикацию')}
        message={error?.message}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[47rem] space-y-4 px-4 py-4">
      <PageHeader
        title={t('Публикация')}
        backHref="/feed"
        backLabel={t('Назад в ленту')}
      />

      <PostCard post={post} detailed onDeleted={() => router.replace('/feed')} />

      <Card className="p-4 sm:p-5">
        <CommentSection postId={post.id} canDelete={post.userId === profile?.userId} />
      </Card>

    </div>
  );
}
