'use client';

import Link from 'next/link';
import { useGetMyProfileQuery } from '@/features/profiles/profilesApi';
import { useSearchUsersQuery, useFollowUserMutation } from '@/features/users/usersApi';
import { Avatar } from '@/components/ui/Avatar';
import { useT } from '@/lib/i18n/LocaleProvider';

export function FeedSuggestions() {
  const t = useT();
  const { data: myProfile } = useGetMyProfileQuery();
  const { data: usersData } = useSearchUsersQuery({ pageSize: 6 });
  const [followUser] = useFollowUserMutation();

  const currentUserName = myProfile?.userName || 'abubakrhomidov2009';
  const currentFullName = myProfile?.fullName || 'Абу Бакр';
  const currentAvatar = myProfile?.avatar;

  const suggestedUsers = (usersData?.items ?? []).filter(
    (u) => u.id !== myProfile?.userId && !u.isFollowing,
  ).slice(0, 5);

  return (
    <aside aria-label="Рекомендации" className="hidden xl:block w-[320px] shrink-0 pt-4 text-xs text-neutral-400">
      {/* Current user switch bar */}
      <div className="flex items-center justify-between py-2">
        <Link href="/profile/me" className="flex items-center gap-3">
          <Avatar src={currentAvatar} name={currentUserName} size="md" className="h-11 w-11" />
          <div className="flex flex-col text-left">
            <span className="font-semibold text-white text-[14px] leading-tight hover:underline">
              {currentUserName}
            </span>
            <span className="text-[12px] text-neutral-400 leading-tight">
              {currentFullName}
            </span>
          </div>
        </Link>
        <button
          type="button"
          className="text-[#0095f6] hover:text-white font-semibold text-xs transition-colors"
        >
          {t('Переключиться')}
        </button>
      </div>

      {/* Header */}
      <div className="mt-5 flex items-center justify-between mb-3">
        <span className="font-semibold text-neutral-400 text-[14px]">{t('Рекомендации для вас')}</span>
        <Link href="/explore" className="font-semibold text-white text-[12px] hover:opacity-70 transition-opacity">
          {t('Все')}
        </Link>
      </div>

      {/* Suggested users list */}
      <div className="space-y-3">
        {suggestedUsers.length > 0 ? (
          suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between py-1">
              <Link href={`/profile/${user.id}`} className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar src={user.avatar} name={user.userName} size="md" className="h-11 w-11 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-white text-[14px] truncate leading-tight hover:underline">
                    {user.userName}
                  </span>
                  <span className="text-[12px] text-neutral-400 truncate leading-tight">
                    {t('Рекомендация для вас')}
                  </span>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => followUser(user.id)}
                className="text-[#0095f6] hover:text-white font-semibold text-xs ml-2 shrink-0 transition-colors"
              >
                {t('Подписаться')}
              </button>
            </div>
          ))
        ) : (
          <div className="text-neutral-500 py-2 text-xs">
            {t('Нет рекомендаций')}
          </div>
        )}
      </div>

      {/* Meta links footer */}
      <nav aria-label="Ссылки Instagram" className="mt-8 text-[11px] text-neutral-500 leading-relaxed">
        <div className="flex flex-wrap gap-x-1.5 gap-y-1">
          <a href="#" className="hover:underline">About</a>•
          <a href="#" className="hover:underline">Help</a>•
          <a href="#" className="hover:underline">Press</a>•
          <a href="#" className="hover:underline">API</a>•
          <a href="#" className="hover:underline">Jobs</a>•
          <a href="#" className="hover:underline">Privacy</a>•
          <a href="#" className="hover:underline">Terms</a>•
          <a href="#" className="hover:underline">Locations</a>•
          <a href="#" className="hover:underline">Language</a>•
          <a href="#" className="hover:underline">Meta Verified</a>
        </div>
        <div className="mt-4 uppercase text-neutral-600 text-[11px] tracking-wider">
          © 2026 INSTAGRAM FROM META
        </div>
      </nav>
    </aside>
  );
}
