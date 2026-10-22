'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Globe, Lock, MessageCircle, Pencil, UserCheck, UserPlus } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { FollowersDialog } from './FollowersDialog';
import { useFollowUserMutation, useUnfollowUserMutation } from '@/features/users/usersApi';
import { useToast } from '@/components/ui/Toast';
import { formatCount } from '@/lib/utils';
import type { Profile } from '@/types';

export interface ProfileHeaderProps {
  profile: Profile;
  /** `true` when the viewer owns the profile. */
  isOwner: boolean;
  onOpenFollowers?: () => void;
  onOpenFollowing?: () => void;
}

/**
 * Header of a profile: avatar, statistics and the primary actions.
 */
export function ProfileHeader({
  profile,
  isOwner,
  onOpenFollowers,
  onOpenFollowing,
}: ProfileHeaderProps) {
  const { toast } = useToast();
  const [dialog, setDialog] = useState<'followers' | 'following' | null>(null);

  const [follow, { isLoading: isFollowing }] = useFollowUserMutation();
  const [unfollow, { isLoading: isUnfollowing }] = useUnfollowUserMutation();

  const toggleFollow = async () => {
    try {
      if (profile.isFollowing) await unfollow(profile.userId).unwrap();
      else await follow(profile.userId).unwrap();
    } catch {
      toast('Не удалось изменить подписку', 'error');
    }
  };

  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
      <Avatar src={profile.avatar} name={profile.fullName || profile.userName} size="xl" />

      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-foreground">{profile.userName}</h1>

          {profile.isPrivate ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Закрытый аккаунт
            </span>
          ) : null}

          <div className="ml-auto flex items-center gap-2">
            {isOwner ? (
              <Link href="/profile/me/edit">
                <Button variant="outline" size="sm" icon={<Pencil className="h-4 w-4" />}>
                  Редактировать
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  size="sm"
                  variant={profile.isFollowing ? 'secondary' : 'primary'}
                  onClick={toggleFollow}
                  loading={isFollowing || isUnfollowing}
                  icon={
                    profile.isFollowing ? (
                      <UserCheck className="h-4 w-4" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )
                  }
                >
                  {profile.isFollowing ? 'Вы подписаны' : 'Подписаться'}
                </Button>

                <Link href="/messages">
                  <Button variant="outline" size="sm" icon={<MessageCircle className="h-4 w-4" />}>
                    Написать
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-foreground">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Публикации</dt>
            <dd className="font-semibold">{formatCount(profile.postsCount)}</dd>
            <dd aria-hidden="true" className="text-muted-foreground">
              публикаций
            </dd>
          </div>

          <button
            type="button"
            onClick={() => {
              setDialog('followers');
              onOpenFollowers?.();
            }}
            className="flex items-center gap-1.5 transition-colors hover:text-muted-foreground"
          >
            <dt className="sr-only">Подписчики</dt>
            <dd className="font-semibold">{formatCount(profile.followersCount)}</dd>
            <dd aria-hidden="true" className="text-muted-foreground">
              подписчиков
            </dd>
          </button>

          <button
            type="button"
            onClick={() => {
              setDialog('following');
              onOpenFollowing?.();
            }}
            className="flex items-center gap-1.5 transition-colors hover:text-muted-foreground"
          >
            <dt className="sr-only">Подписки</dt>
            <dd className="font-semibold">{formatCount(profile.followingCount)}</dd>
            <dd aria-hidden="true" className="text-muted-foreground">
              подписок
            </dd>
          </button>
        </dl>

        <div className="space-y-1 text-sm">
          {profile.fullName ? (
            <p className="font-semibold text-foreground">{profile.fullName}</p>
          ) : null}

          {profile.bio ? (
            <p className="whitespace-pre-line leading-relaxed text-foreground">{profile.bio}</p>
          ) : null}

          {profile.website ? (
            <a
              href={profile.website}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
            >
              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
              {profile.website.replace(/^https?:\/\//, '')}
            </a>
          ) : null}
        </div>
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
