'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Card, ErrorState, LoadingState } from '@/components/ui/States';
import { PageHeader } from '@/components/layout/PageHeader';
import { PostCard } from '@/components/feed/PostCard';
import { CommentSection } from './CommentSection';
import { useGetPostQuery, useRecordPostViewMutation } from '@/features/posts/postsApi';
import { useGetMyProfileQuery } from '@/features/profiles/profilesApi';

/**
 * Single post page.
 *
 * The identifier comes from the router (`useParams`), therefore the page
 * needs no server-side data access.
 */
export function PostDetail() {
  const params = useParams<{ postId: string }>();
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
        title="Некорректный адрес публикации"
        message="Идентификатор публикации должен быть числом."
      />
    );
  }

  if (isLoading) {
    return <LoadingState label="Загружаем публикацию…" />;
  }

  if (isError || !post) {
    return (
      <ErrorState
        title="Не удалось загрузить публикацию"
        message={error?.message}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[47rem] space-y-4 px-4 py-4">
      <PageHeader
        title="Публикация"
        backHref="/feed"
        backLabel="Назад в ленту"
      />

      <PostCard post={post} detailed owned={post.userId === profile?.userId} />

      <Card className="p-4 sm:p-5">
        <CommentSection postId={post.id} canDelete={post.userId === profile?.userId} />
      </Card>

      {post.images.length > 1 ? (
        <Link
          href={`/post/${post.id}`}
          className="block text-center text-xs text-muted-foreground hover:text-foreground"
        >
          Открыть все изображения
        </Link>
      ) : null}
    </div>
  );
}
