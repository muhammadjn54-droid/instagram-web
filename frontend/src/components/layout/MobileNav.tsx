'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Home, MessageCircle, PlusSquare } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useGetMyProfileQuery } from '@/features/profiles/profilesApi';
import { Avatar } from '@/components/ui/Avatar';
import { useT } from '@/lib/i18n/LocaleProvider';

/**
 * Bottom navigation bar for small screens.
 */
export function MobileNav() {
  const t = useT();
  const pathname = usePathname();
  const { data: profile } = useGetMyProfileQuery();

  const items = [
    { href: '/feed', label: t('Главная'), icon: Home },
    { href: '/explore', label: t('Поиск'), icon: Compass },
    { href: '/post/new', label: t('Создать'), icon: PlusSquare },
    { href: '/messages', label: t('Сообщения'), icon: MessageCircle },
  ];

  return (
    <nav
      aria-label={t('Мобильная навигация')}
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {items.map((item) => {
        const active =
          item.href === '/feed'
            ? pathname === '/feed'
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
              active ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}

      <Link
        href="/profile/me"
        aria-current={pathname.startsWith('/profile') ? 'page' : undefined}
        className={cn(
          'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
          pathname.startsWith('/profile') ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        <Avatar
          src={profile?.avatar}
          name={profile?.fullName ?? profile?.userName}
          size="xs"
        />
        <span>{t('Профиль')}</span>
      </Link>
    </nav>
  );
}
