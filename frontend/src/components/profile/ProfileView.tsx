'use client';

import { useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Bookmark, Clapperboard, Grid3x3, ImageOff, Lock, Plus } from 'lucide-react';

import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Avatar } from '@/components/ui/Avatar';
import { TimeAgo } from '@/components/shared/TimeAgo';
import { useToast } from '@/components/ui/Toast';
import { ExploreGrid } from '@/components/feed/ExploreGrid';
import { PostTile } from '@/components/feed/PostTile';
import { StoryViewer } from '@/components/feed/StoryViewer';
import { ProfileHeader } from './ProfileHeader';
import {
  useGetFavoritesQuery,
  useGetMyProfileQuery,
  useGetProfileQuery,
} from '@/features/profiles/profilesApi';
import {
  useCreateStoryMutation,
  useGetMyStoriesQuery,
  useGetUserStoriesQuery,
} from '@/features/stories/storiesApi';
import { cn, getErrorMessage, validateImageFile } from '@/lib/utils';
import type { UserStoriesGroup } from '@/types';
import { useT } from '@/lib/i18n/LocaleProvider';

type Tab = 'posts' | 'reels' | 'saved';

/**
 * Profile page.
 *
 * `/profile/me` renders the own profile, `/profile/[userId]` renders someone
 * else's. The identifier is read from the router, so no server-side request
 * is required.
 */
export function ProfileView() {
  const t = useT();
  const params = useParams<{ userId: string }>();
  const { toast } = useToast();
  const rawId = params?.userId;
  const isMe = !rawId || rawId === 'me';
  const otherId = Number(rawId);
  const validOtherId = Number.isFinite(otherId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>('posts');
  const [storiesOpen, setStoriesOpen] = useState(false);
  const [startStoryId, setStartStoryId] = useState<number | undefined>(undefined);

  const openStories = (storyId?: number) => {
    setStartStoryId(storyId);
    setStoriesOpen(true);
  };

  const myProfile = useGetMyProfileQuery();
  const otherProfile = useGetProfileQuery(otherId, { skip: isMe || !validOtherId });

  const profileQuery = isMe ? myProfile : otherProfile;
  const profile = profileQuery.data;

  const myStories = useGetMyStoriesQuery(undefined, { skip: !isMe });
  const userStories = useGetUserStoriesQuery(otherId, { skip: isMe || !validOtherId });
  const stories = (isMe ? myStories.data : userStories.data) ?? [];

  const [createStory, { isLoading: isUploading }] = useCreateStoryMutation();

  if (profileQuery.isLoading) {
    return <LoadingState label={t('Загружаем профиль…')} />;
  }

  if (profileQuery.isError || !profile) {
    return (
      <ErrorState
        title={t('Не удалось загрузить профиль')}
        message={profileQuery.error?.message}
        onRetry={profileQuery.refetch}
      />
    );
  }

  const canSeePosts = isMe || !profile.isPrivate || profile.isFollowing;

  const storyGroup: UserStoriesGroup | null =
    stories.length > 0
      ? {
          userId: profile.userId,
          userName: profile.userName,
          userAvatar: profile.avatar,
          stories,
        }
      : null;

  /** The "New" circle: pick a picture and publish it as a story, right here. */
  const handleStoryFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const problem = validateImageFile(file);
    if (problem) {
      toast(problem, 'error');
      return;
    }

    try {
      await createStory({ file }).unwrap();
      toast(t('История опубликована'), 'success');
    } catch (error) {
      toast(getErrorMessage(error, t('Не удалось загрузить историю')), 'error');
    }
  };

  const tabs: Array<{ id: Tab; label: string; icon: typeof Grid3x3 }> = [
    { id: 'posts', label: t('Публикации'), icon: Grid3x3 },
    { id: 'reels', label: 'Reels', icon: Clapperboard },
    ...(isMe ? [{ id: 'saved' as const, label: t('Сохранённое'), icon: Bookmark }] : []),
  ];

  return (
    <div className="mx-auto w-full max-w-[1406px] space-y-10 px-0 py-8 sm:px-4">
      <ProfileHeader
        profile={profile}
        isOwner={isMe}
        hasStories={storyGroup !== null}
        onOpenStories={() => openStories()}
      />

      {isMe ? (
        <div className="mx-auto flex w-full max-w-[860px] gap-6 overflow-x-auto px-4 pb-1 scrollbar-none sm:px-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            aria-label={t('Добавить историю')}
            className="group flex w-28 shrink-0 flex-col items-center gap-2 disabled:opacity-60"
          >
            <span className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-border-strong bg-surface-muted text-muted-foreground transition-colors group-hover:bg-border">
              {isUploading ? (
                <span className="h-7 w-7 animate-spin-slow rounded-full border-2 border-muted-foreground/40 border-t-foreground" />
              ) : (
                <Plus className="h-10 w-10" strokeWidth={1.5} aria-hidden="true" />
              )}
            </span>
            <span className="text-sm font-semibold text-foreground">{t('Новая')}</span>
          </button>

          {storyGroup?.stories.map((story, position) => (
            <button
              key={story.id}
              type="button"
              onClick={() => openStories(story.id)}
              aria-label={t('Смотреть историю {n}', { n: position + 1 })}
              className="flex w-28 shrink-0 flex-col items-center gap-2"
            >
              <Avatar src={story.imageUrl} name={profile.userName} size="xl" ring />
              <TimeAgo value={story.createdAt} className="text-sm text-muted-foreground" />
            </button>
          ))}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleStoryFile}
          />
        </div>
      ) : null}

      <div>
        <div
          role="tablist"
          aria-label={t('Разделы профиля')}
          className="flex justify-center gap-10 border-t border-border sm:gap-16"
        >
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={item.label}
                onClick={() => setTab(item.id)}
                className={cn(
                  '-mt-px flex items-center gap-2 border-t-2 px-2 py-4 text-xs font-semibold uppercase tracking-wide transition-colors',
                  active
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        {!canSeePosts ? (
          <p className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" aria-hidden="true" />
            {t('Это закрытый аккаунт. Подпишитесь, чтобы видеть публикации.')}
          </p>
        ) : tab === 'saved' && isMe ? (
          <SavedGrid />
        ) : (
          <ExploreGrid
            key={tab}
            userId={profile.userId}
            isReel={tab === 'reels' ? true : undefined}
            emptyState={
              <EmptyState
                icon={<ImageOff className="h-6 w-6" aria-hidden="true" />}
                title={tab === 'reels' ? t('Reels пока нет') : t('Публикаций пока нет')}
                description={
                  isMe
                    ? t('Создайте первую публикацию — она появится здесь.')
                    : t('Этот пользователь ещё ничего не опубликовал.')
                }
              />
            }
          />
        )}
      </div>

      <StoryViewer
        groups={storyGroup ? [storyGroup] : []}
        activeUserId={storiesOpen ? profile.userId : null}
        initialStoryId={startStoryId}
        onSelectUser={() => undefined}
        onClose={() => setStoriesOpen(false)}
      />
    </div>
  );
}

/** Saved posts of the signed-in user (up to 100, the API page limit). */
function SavedGrid() {
  const t = useT();
  const { data, isLoading, isError, error, refetch } = useGetFavoritesQuery({
    pageNumber: 1,
    pageSize: 100,
  });

  if (isLoading) {
    return <LoadingState label={t('Загружаем сохранённое…')} />;
  }

  if (isError) {
    return <ErrorState message={error?.message} onRetry={refetch} />;
  }

  const items = data?.items ?? [];

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Bookmark className="h-6 w-6" aria-hidden="true" />}
        title={t('Здесь пока пусто')}
        description={t('Сохраняйте публикации, чтобы вернуться к ним позже.')}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-px sm:grid-cols-3 xl:grid-cols-4">
      {items.map((post) => (
        <PostTile key={post.id} post={post} />
      ))}
    </div>
  );
}
