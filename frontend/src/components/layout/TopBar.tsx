'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import { useGetMyProfileQuery } from '@/features/profiles/profilesApi';
import { Logo } from './Logo';
import { useT } from '@/lib/i18n/LocaleProvider';

/**
 * Sticky header shown on small screens.
 */
export function TopBar() {
  const t = useT();
  const pathname = usePathname();
  const { data: profile } = useGetMyProfileQuery();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur lg:hidden">
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <Link href="/feed" aria-label={t('Instagram — на главную')}>
          <Logo showWordmark={false} />
        </Link>

        <Link
          href="/search"
          className="flex h-9 items-center gap-2 rounded-pill bg-surface-muted px-3 text-xs text-muted-foreground"
          aria-label={t('Поиск')}
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          <span>{t('Поиск')}</span>
        </Link>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={t('Уведомления')}
            className="flex h-9 w-9 items-center justify-center rounded-control text-foreground transition-colors hover:bg-surface-muted"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>

          <Link
            href="/profile/me"
            aria-label={t('Мой профиль')}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-pill',
              pathname.startsWith('/profile') && 'ring-2 ring-foreground',
            )}
          >
            <Avatar
              src={profile?.avatar}
              name={profile?.fullName ?? profile?.userName}
              size="xs"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
