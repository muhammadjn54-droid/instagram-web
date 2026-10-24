'use client';

import Link from 'next/link';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { useGetMyProfileQuery } from '@/features/profiles/profilesApi';
import { useFollowUserMutation, useGetFollowersQuery, useGetFollowingQuery, useUnfollowUserMutation } from '@/features/users/usersApi';
import { useT } from '@/lib/i18n/LocaleProvider';

export interface FollowersDialogProps {
  open: boolean;
  mode: 'followers' | 'following';
  userId: number;
  onClose: () => void;
}

/**
 * Dialog with the followers / following list.
 */
export function FollowersDialog({ open, mode, userId, onClose }: FollowersDialogProps) {
  const t = useT();
  const { data: myProfile } = useGetMyProfileQuery();

  const followers = useGetFollowersQuery(
    { userId, pageNumber: 1, pageSize: 50 },
    { skip: !open || mode !== 'followers' },
  );
  const following = useGetFollowingQuery(
    { userId, pageNumber: 1, pageSize: 50 },
    { skip: !open || mode !== 'following' },
  );

  const query = mode === 'followers' ? followers : following;
  const [follow] = useFollowUserMutation();
  const [unfollow] = useUnfollowUserMutation();

  const toggleFollow = async (targetUserId: number, isFollowing: boolean) => {
    try {
      if (isFollowing) await unfollow(targetUserId).unwrap();
      else await follow(targetUserId).unwrap();
    } catch {
      // The list is refreshed by the invalidated tags; a failed toggle simply keeps the old state.
    }
  };

  const items = query.data?.items ?? [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={mode === 'followers' ? t('Подписчики') : t('Подписки')}
      size="sm"
    >
      {query.isLoading ? (
        <LoadingState label={t('Загружаем список…')} />
      ) : query.isError ? (
        <ErrorState message={query.error?.message} onRetry={query.refetch} />
      ) : items.length === 0 ? (
        <EmptyState
          title={mode === 'followers' ? t('Пока нет подписчиков') : t('Пока нет подписок')}
          className="border-0 py-8"
        />
      ) : (
        <ul className="space-y-4">
          {items.map((user) => (
            <li key={user.userId} className="flex items-center gap-3">
              <Link href={`/profile/${user.userId}`} onClick={onClose}>
                <Avatar src={user.avatar} name={user.fullName || user.userName} size="sm" />
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/profile/${user.userId}`}
                  onClick={onClose}
                  className="block truncate text-sm font-semibold text-foreground hover:underline"
                >
                  {user.fullName || user.userName}
                </Link>
                <span className="block truncate text-xs text-muted-foreground">
                  @{user.userName}
                </span>
              </div>

              {user.userId !== myProfile?.userId ? (
                <Button
                  variant={user.isFollowing ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => toggleFollow(user.userId, user.isFollowing)}
                >
                  {user.isFollowing ? t('Отписаться') : t('Подписаться')}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </Dialog>
  );
}
