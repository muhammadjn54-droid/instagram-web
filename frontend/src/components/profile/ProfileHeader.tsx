'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Globe, Lock, Settings } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { FollowersDialog } from './FollowersDialog';
import { useGetOrCreateChatMutation } from '@/features/chats/chatsApi';
import { useFollowUserMutation, useUnfollowUserMutation } from '@/features/users/usersApi';
import { useToast } from '@/components/ui/Toast';
import { cn, formatCount, getErrorMessage } from '@/lib/utils';
import type { Profile } from '@/types';
import { useT } from '@/lib/i18n/LocaleProvider';

export interface ProfileHeaderProps {
  profile: Profile;
  /** `true` when the viewer owns the profile. */
  isOwner: boolean;
  /** The user has active stories: the avatar gets a ring and opens them. */
  hasStories?: boolean;
  onOpenStories?: () => void;
}

const WIDE_BUTTON =
  'flex h-11 flex-1 items-center justify-center rounded-lg bg-surface-muted px-4 text-sm font-semibold text-foreground transition-colors hover:bg-border';

/**
 * Header of a profile: big avatar, name, counters, bio and the main actions.
 */
export function ProfileHeader({
  profile,
  isOwner,
  hasStories = false,
  onOpenStories,
}: ProfileHeaderProps) {
  const t = useT();
  const { toast } = useToast();
  const router = useRouter();
  const [dialog, setDialog] = useState<'followers' | 'following' | null>(null);

  const [follow, { isLoading: isFollowing }] = useFollowUserMutation();
  const [unfollow, { isLoading: isUnfollowing }] = useUnfollowUserMutation();
  const [openChat, { isLoading: isOpeningChat }] = useGetOrCreateChatMutation();

  const toggleFollow = async () => {
    try {
      if (profile.isFollowing) await unfollow(profile.userId).unwrap();
      else await follow(profile.userId).unwrap();
    } catch (error) {
      toast(getErrorMessage(error, t('Не удалось изменить подписку')), 'error');
    }
  };

  const startChat = async () => {
    try {
      const chat = await openChat(profile.userId).unwrap();
      router.push(`/messages/${chat.id}`);
    } catch (error) {
      toast(getErrorMessage(error, t('Не удалось открыть диалог')), 'error');
    }
  };

  const avatar = (
    <Avatar
      src={profile.avatar}
      name={profile.fullName || profile.userName}
      size="profile"
      ring={hasStories}
    />
  );

  return (
    <section className="mx-auto grid w-full max-w-[860px] gap-6 px-4 sm:grid-cols-[auto_1fr] sm:gap-x-20 sm:gap-y-8 sm:px-0">
      <div className="flex justify-center sm:justify-start">
        {hasStories ? (
          <button
            type="button"
            onClick={onOpenStories}
            aria-label={t('Смотреть истории')}
            className="rounded-full transition-transform hover:scale-[1.02]"
          >
            {avatar}
          </button>
        ) : (
          avatar
        )}
      </div>

      <div className="min-w-0 space-y-4 text-center sm:space-y-5 sm:pt-4 sm:text-left">
        <div className="flex items-center justify-center gap-3 sm:justify-start">
          <h1 className="truncate text-xl font-bold text-foreground sm:text-2xl">
            {profile.userName}
          </h1>

          {isOwner ? (
            <Link
              href="/profile/me/edit"
              aria-label={t('Настройки профиля')}
              className="flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-surface-muted"
            >
              <Settings className="h-6 w-6" aria-hidden="true" />
            </Link>
          ) : null}

          {profile.isPrivate ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              {t('Закрытый аккаунт')}
            </span>
          ) : null}
        </div>

        {profile.fullName ? (
          <p className="text-base font-medium text-foreground">{profile.fullName}</p>
        ) : null}

        <dl className="flex items-center justify-center gap-x-8 text-base text-foreground sm:justify-start">
          <div className="flex items-baseline gap-1.5">
            <dd className="font-semibold">{formatCount(profile.postsCount)}</dd>
            <dt className="text-foreground">{t('публикаций')}</dt>
          </div>

          <button
            type="button"
            onClick={() => setDialog('followers')}
            className="flex items-baseline gap-1.5 hover:opacity-70"
          >
            <dd className="font-semibold">{formatCount(profile.followersCount)}</dd>
            <dt>{t('подписчиков')}</dt>
          </button>

          <button
            type="button"
            onClick={() => setDialog('following')}
            className="flex items-baseline gap-1.5 hover:opacity-70"
          >
            <dd className="font-semibold">{formatCount(profile.followingCount)}</dd>
            <dt>{t('подписок')}</dt>
          </button>
        </dl>

        {profile.bio ? (
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
            {profile.bio}
          </p>
        ) : null}

        {profile.website ? (
          <a
            href={profile.website}
            target="_blank"
            rel="noreferrer noopener nofollow"
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
          >
            <Globe className="h-3.5 w-3.5" aria-hidden="true" />
            {profile.website.replace(/^https?:\/\//, '')}
          </a>
        ) : null}
      </div>

      <div className="flex gap-3 sm:col-span-2">
        {isOwner ? (
          <>
            <Link href="/profile/me/edit" className={WIDE_BUTTON}>
              {t('Редактировать профиль')}
            </Link>
            <Link href="/saved" className={WIDE_BUTTON}>
              {t('Сохранённое')}
            </Link>
          </>
        ) : (
          <>
            <Button
              variant={profile.isFollowing ? 'secondary' : 'primary'}
              onClick={toggleFollow}
              loading={isFollowing || isUnfollowing}
              className={cn('h-11 flex-1 rounded-lg font-semibold')}
            >
              {profile.isFollowing ? t('Вы подписаны') : t('Подписаться')}
            </Button>
            <Button
              variant="secondary"
              onClick={startChat}
              loading={isOpeningChat}
              className="h-11 flex-1 rounded-lg font-semibold"
            >
              {t('Написать')}
            </Button>
          </>
        )}
      </div>

      <FollowersDialog
        open={dialog !== null}
        mode={dialog ?? 'followers'}
        userId={profile.userId}
        onClose={() => setDialog(null)}
      />
    </section>
  );
}
