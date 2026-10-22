'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ImageOff, Lock } from 'lucide-react';

import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Tabs } from '@/components/ui/Tabs';
import { MediaImage } from '@/components/shared/MediaImage';
import { PostGrid } from '@/components/feed/PostGrid';
import { ProfileHeader } from './ProfileHeader';
import { usePageParam } from '@/components/shared/usePageParam';
import {
  useGetFavoritesQuery,
  useGetMyProfileQuery,
  useGetProfileQuery,
} from '@/features/profiles/profilesApi';
import { useGetPostsQuery } from '@/features/posts/postsApi';

/**
 * Profile page.
 *
 * `/profile/me` renders the own profile, `/profile/[userId]` renders someone
 * else's. The identifier is read from the router, so no server-side request
 * is required.
 */
export function ProfileView() {
  const params = useParams<{ userId: string }>();
  const rawId = params?.userId;
  const isMe = !rawId || rawId === 'me';

  const [page, setPage] = usePageParam();
  const [tab, setTab] = useState<'posts' | 'saved'>('posts');

  const myProfile = useGetMyProfileQuery();
  const otherProfile = useGetProfileQuery(Number(rawId), {
    skip: isMe || !Number.isFinite(Number(rawId)),
  });

  const profileQuery = isMe ? myProfile : otherProfile;
  const profile = profileQuery.data;

  const posts = useGetPostsQuery(
    {
      userId: isMe ? undefined : Number(rawId),
      pageNumber: page,
      pageSize: 18,
    },
    { skip: !isMe && !Number.isFinite(Number(rawId)) },
  );

  if (profileQuery.isLoading) {
    return <LoadingState label="Загружаем профиль…" />;
  }

  if (profileQuery.isError || !profile) {
    return (
      <ErrorState
        title="Не удалось загрузить профиль"
        message={profileQuery.error?.message}
        onRetry={profileQuery.refetch}
      />
    );
  }

  const tabs =
    isMe && tab === 'saved'
      ? [{ id: 'saved', label: 'Сохранённые' }]
      : [{ id: 'posts', label: 'Публикации' }];

  return (
    <div className="mx-auto w-full max-w-[64rem] space-y-6 px-4 py-6">
      <ProfileHeader profile={profile} isOwner={isMe} />

      <Tabs
        items={isMe ? [{ id: 'posts', label: 'Публикации' }, { id: 'saved', label: 'Сохранённые' }] : tabs}
        active={tab}
        onChange={(id) => setTab(id as 'posts' | 'saved')}
      />

      {tab === 'saved' && isMe ? (
        <SavedPosts />
      ) : posts.isLoading ? (
        <LoadingState label="Загружаем публикации…" />
      ) : posts.isError ? (
        <ErrorState message={posts.error?.message} onRetry={posts.refetch} />
      ) : (
        <>
          <PostGrid
            posts={posts.data?.items ?? []}
            emptyState={
              <EmptyState
                icon={<ImageOff className="h-6 w-6" aria-hidden="true" />}
                title="Публикаций пока нет"
                description={
                  isMe
                    ? 'Создайте первую публикацию — она появится здесь.'
                    : 'Этот пользователь ещё ничего не опубликовал.'
                }
              />
            }
          />

          {posts.data && posts.data.totalPages > 1 ? (
            <nav className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="rounded-control border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-muted disabled:opacity-40"
              >
                Назад
              </button>
              <span className="px-3 py-1.5 text-xs text-muted-foreground">
                {posts.data.pageNumber} / {posts.data.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={page >= posts.data.totalPages}
                className="rounded-control border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-muted disabled:opacity-40"
              >
                Далее
              </button>
            </nav>
          ) : null}
        </>
      )}

      {profile.isPrivate && !isMe ? (
        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          Публикации этого аккаунта скрыты
        </p>
      ) : null}
    </div>
  );
}

function SavedPosts() {
  const [page, setPage] = usePageParam();
  const { data, isLoading, isError, error, refetch } = useGetFavoritesQuery({
    pageNumber: page,
    pageSize: 18,
  });

  if (isLoading) {
    return <LoadingState label="Загружаем сохранённое…" />;
  }

  if (isError) {
    return <ErrorState message={error?.message} onRetry={refetch} />;
  }

  const items = data?.items ?? [];

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ImageOff className="h-6 w-6" aria-hidden="true" />}
        title="Здесь пока пусто"
        description="Сохраняйте публикации, чтобы вернуться к ним позже."
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 sm:gap-2">
        {items.map((item) => (
          <MediaImage
            key={item.id}
            src={item.images?.[0]?.url}
            alt={item.title ?? item.content ?? 'Сохранённая публикация'}
            aspectClassName="aspect-square"
            fallback={<ImageOff className="h-5 w-5" aria-hidden="true" />}
          />
        ))}
      </div>

      {data && data.totalPages > 1 ? (
        <nav className="flex justify-center gap-2 pt-4">
          <button
            type="button"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="rounded-control border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-muted disabled:opacity-40"
          >
            Назад
          </button>
          <span className="px-3 py-1.5 text-xs text-muted-foreground">
            {data.pageNumber} / {data.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage(page + 1)}
            disabled={page >= data.totalPages}
            className="rounded-control border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-muted disabled:opacity-40"
          >
            Далее
          </button>
        </nav>
      ) : null}
    </>
  );
}
