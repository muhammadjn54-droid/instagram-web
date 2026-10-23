'use client';

import { useState, type Ref } from 'react';
import Link from 'next/link';
import { Heart, X } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { ErrorState, LoadingState } from '@/components/ui/States';
import { TimeAgo } from '@/components/shared/TimeAgo';
import { useToast } from '@/components/ui/Toast';
import { useGetNotificationsQuery } from '@/features/notifications/notificationsApi';
import { useFollowUserMutation, useUnfollowUserMutation } from '@/features/users/usersApi';
import { getMediaUrl } from '@/lib/media';
import { cn, getErrorMessage } from '@/lib/utils';
import type { Notification } from '@/types';
import { useT } from '@/lib/i18n/LocaleProvider';
import { tr } from '@/lib/i18n/core';

type Filter = 'all' | 'following' | 'comments' | 'follows' | 'likes';

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: tr('Все') },
  { id: 'following', label: tr('Люди, на которых вы подписаны') },
  { id: 'comments', label: tr('Комментарии') },
  { id: 'follows', label: tr('Подписки') },
  { id: 'likes', label: tr('Лайки') },
];

const VIDEO_EXTENSION = /\.(mp4|webm|ogv)(\?.*)?$/i;
const DAY_MS = 24 * 60 * 60 * 1000;

function matchesFilter(item: Notification, filter: Filter): boolean {
  switch (filter) {
    case 'following':
      return item.actor.isFollowing;
    case 'comments':
      return item.type === 'comment';
    case 'follows':
      return item.type === 'follow';
    case 'likes':
      return item.type === 'like' || item.type === 'story_like';
    default:
      return true;
  }
}

const SECTION_ORDER = [tr('Сегодня'), tr('Вчера'), tr('На этой неделе'), tr('В этом месяце'), tr('Ранее')] as const;

/** Calendar based grouping: today, yesterday, last 7 days, last 30 days, older. */
function sectionOf(value: string): (typeof SECTION_ORDER)[number] {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const age = startOfToday.getTime() - new Date(value).getTime();
  if (age < 0) return tr('Сегодня');
  if (age < DAY_MS) return tr('Вчера');
  if (age < 7 * DAY_MS) return tr('На этой неделе');
  if (age < 30 * DAY_MS) return tr('В этом месяце');
  return tr('Ранее');
}

/**
 * Activity panel that slides out next to the sidebar: new followers, likes and
 * comments on the user's posts and likes on their stories, grouped by age.
 */
export function NotificationsPanel({
  panelRef,
  onClose,
}: {
  panelRef: Ref<HTMLDivElement>;
  onClose: () => void;
}) {
  const t = useT();
  const [filter, setFilter] = useState<Filter>('all');
  const { data, isLoading, isError, error, refetch } = useGetNotificationsQuery(undefined, {
    pollingInterval: 30_000,
    refetchOnMountOrArgChange: true,
  });

  const items = (data ?? []).filter((item) => matchesFilter(item, filter));
  const groups = SECTION_ORDER.map((title) => ({
    title,
    items: items.filter((item) => sectionOf(item.createdAt) === title),
  })).filter((group) => group.items.length > 0);

  return (
    <div
      ref={panelRef}
      id="notifications-panel"
      role="dialog"
      aria-label={t('Уведомления')}
      className="fixed inset-y-0 left-[72px] z-30 hidden w-[420px] flex-col rounded-r-2xl border-r border-border bg-surface shadow-popover lg:flex"
    >
      <div className="flex items-center justify-between px-6 pb-4 pt-8">
        <h2 className="text-2xl font-bold text-foreground">{t('Уведомления')}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('Закрыть уведомления')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-surface-muted"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div
        role="tablist"
        aria-label={t('Фильтр уведомлений')}
        className="flex gap-2 overflow-x-auto px-6 pb-4 scrollbar-none"
      >
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-pill border px-4 py-2 text-sm font-semibold transition-colors',
              filter === item.id
                ? 'border-transparent bg-surface-muted text-foreground'
                : 'border-border-strong text-foreground hover:bg-surface-muted',
            )}
          >
            {t(item.label)}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8">
        {isLoading ? (
          <LoadingState label={t('Загружаем уведомления…')} />
        ) : isError ? (
          <ErrorState message={error?.message} onRetry={refetch} />
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-foreground">
              <Heart className="h-8 w-8 text-foreground" aria-hidden="true" />
            </span>
            <p className="text-sm font-semibold text-foreground">{t('Активность в вашем аккаунте')}</p>
            <p className="text-sm text-muted-foreground">
              {filter === 'all'
                ? t('Когда кто-то подпишется, поставит лайк или оставит комментарий, вы увидите это здесь.')
                : t('В этой категории пока ничего нет.')}
            </p>
          </div>
        ) : (
          groups.map((group, index) => (
            <section
              key={group.title}
              className={cn(index > 0 && 'mt-4 border-t border-border pt-4')}
            >
              <h3 className="pb-3 text-base font-bold text-foreground">{t(group.title)}</h3>
              <ul className="space-y-4">
                {group.items.map((item) => (
                  <NotificationRow key={item.id} item={item} onNavigate={onClose} />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

function NotificationRow({ item, onNavigate }: { item: Notification; onNavigate: () => void }) {
  const t = useT();
  const { toast } = useToast();
  const [follow, { isLoading: isFollowing }] = useFollowUserMutation();
  const [unfollow, { isLoading: isUnfollowing }] = useUnfollowUserMutation();

  const { actor } = item;
  const profileHref = `/profile/${actor.id}`;
  const targetHref = item.target?.postId ? `/post/${item.target.postId}` : null;

  const toggleFollow = async () => {
    try {
      if (actor.isFollowing) await unfollow(actor.id).unwrap();
      else await follow(actor.id).unwrap();
    } catch (error) {
      toast(getErrorMessage(error, t('Не удалось изменить подписку')), 'error');
    }
  };

  const action = {
    follow: t('подписался(-ась) на вас.'),
    like: t('оценил(а) вашу публикацию.'),
    comment: t('прокомментировал(а):'),
    story_like: t('оценил(а) вашу историю.'),
  }[item.type];

  const thumbUrl = getMediaUrl(item.target?.image);
  const thumb = thumbUrl ? (
    VIDEO_EXTENSION.test(thumbUrl) ? (
      <video
        src={`${thumbUrl}#t=0.1`}
        muted
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
      />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element -- backend media is served from another origin
      <img src={thumbUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
    )
  ) : null;

  return (
    <li className="flex items-center gap-3">
      <Link href={profileHref} onClick={onNavigate} aria-label={t('Профиль {name}', { name: actor.userName })}>
        <Avatar src={actor.avatar} name={actor.fullName || actor.userName} size="md" />
      </Link>

      <p className="min-w-0 flex-1 text-sm leading-snug text-foreground">
        <Link
          href={profileHref}
          onClick={onNavigate}
          className="font-semibold hover:underline"
        >
          {actor.userName}
        </Link>{' '}
        {action}
        {item.type === 'comment' && item.text ? (
          <span className="line-clamp-2 block text-foreground">{item.text}</span>
        ) : null}{' '}
        <TimeAgo value={item.createdAt} className="text-muted-foreground" />
      </p>

      {item.type === 'follow' ? (
        <Button
          size="sm"
          variant={actor.isFollowing ? 'secondary' : 'primary'}
          onClick={toggleFollow}
          loading={isFollowing || isUnfollowing}
          className="shrink-0"
        >
          {actor.isFollowing ? t('Вы подписаны') : t('Подписаться в ответ')}
        </Button>
      ) : thumb ? (
        targetHref ? (
          <Link
            href={targetHref}
            onClick={onNavigate}
            aria-label={t('Открыть публикацию')}
            className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-surface-muted"
          >
            {thumb}
          </Link>
        ) : (
          <span className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-surface-muted">
            {thumb}
          </span>
        )
      ) : null}
    </li>
  );
}
