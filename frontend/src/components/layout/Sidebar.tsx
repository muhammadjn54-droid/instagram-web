'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useLogoutMutation } from '@/features/account/accountApi';
import { useGetMyProfileQuery } from '@/features/profiles/profilesApi';
import { Logo } from './Logo';
import { NAV_ITEMS, NavLink } from './navItems';
import { ThemeToggle } from './ThemeToggle';

/**
 * Desktop navigation rail.
 *
 * Hidden below the `lg` breakpoint where the bottom bar takes over.
 */
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { data: profile } = useGetMyProfileQuery();
  const [logout, { isLoading }] = useLogoutMutation();

  const displayName = profile?.fullName || profile?.userName || 'Профиль';
  const userName = profile?.userName ?? '';

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      toast('Вы вышли из аккаунта', 'success');
    } catch {
      toast('Не удалось завершить сеанс', 'error');
    } finally {
      router.replace('/login');
      router.refresh();
    }
  };

  return (
    <aside
      aria-label="Основная навигация"
      className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-surface lg:flex"
    >
      <div className="px-5 py-5">
        <Link href="/feed" aria-label="Instagram — на главную">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}

        <Link
          href="/search"
          aria-current={pathname === '/search' ? 'page' : undefined}
          className="flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <SearchGlyph />
          <span>Поиск</span>
        </Link>
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/profile/me"
          className="flex items-center gap-3 rounded-control px-2 py-2 transition-colors hover:bg-surface-muted"
        >
          <Avatar src={profile?.avatar} name={displayName} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-foreground">
              {displayName}
            </span>
            {userName ? (
              <span className="block truncate text-xs text-muted-foreground">@{userName}</span>
            ) : null}
          </span>
        </Link>

        <div className="mt-1 flex items-center gap-1 px-1">
          <ThemeToggle />

          <Link
            href="/profile/me/edit"
            aria-label="Настройки профиля"
            className="flex h-9 w-9 items-center justify-center rounded-control text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <Settings className="h-4.5 w-4.5" aria-hidden="true" />
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            loading={isLoading}
            icon={<LogOut className="h-4 w-4" />}
            className="flex-1 justify-start"
          >
            Выйти
          </Button>
        </div>
      </div>
    </aside>
  );
}

function SearchGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
