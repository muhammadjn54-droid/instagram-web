'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bookmark,
  CirclePlay,
  Heart,
  KeyRound,
  Languages,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  type LucideIcon,
} from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/Toast';
import { useLogoutMutation } from '@/features/account/accountApi';
import { useGetMyProfileQuery } from '@/features/profiles/profilesApi';
import { applyTheme, writeThemeCookie } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { NotificationsPanel } from './NotificationsPanel';
import { CREATE_NAV_ITEM, PRIMARY_NAV_ITEMS, isActivePath } from './navItems';
import { useLocale, useT } from '@/lib/i18n/LocaleProvider';

/** Text next to an icon: hidden while the rail is collapsed, shown when it expands. */
const LABEL = 'sr-only';

const ROW =
  'group/row flex h-12 w-12 items-center justify-center rounded-xl text-neutral-200 ' +
  'transition-all hover:bg-[#1a1a1a] hover:text-white hover:scale-105 active:scale-95';

const ICON_BOX =
  'flex h-6 w-6 shrink-0 items-center justify-center';

/**
 * Desktop navigation rail.
 *
 * Collapsed it is a 72 px column of icons; when the pointer (or keyboard
 * focus) enters it grows to 244 px and shows the labels, overlaying the page
 * so the content never shifts. It lives in the shared app shell, therefore it
 * is identical on every authenticated page. Hidden below `lg`, where the
 * bottom bar takes over.
 */
export function Sidebar() {
  const t = useT();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { data: profile } = useGetMyProfileQuery();
  const [logout] = useLogoutMutation();

  const [moreOpen, setMoreOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const railRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const closeMenus = () => {
    setMoreOpen(false);
    setNotificationsOpen(false);
  };

  useEffect(() => {
    if (!moreOpen && !notificationsOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (railRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setMoreOpen(false);
      setNotificationsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMoreOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [moreOpen, notificationsOpen]);

  const handleLogout = async () => {
    closeMenus();
    try {
      await logout().unwrap();
      toast(t('Вы вышли из аккаунта'), 'success');
    } catch {
      toast(t('Не удалось завершить сеанс'), 'error');
    } finally {
      router.replace('/login');
      router.refresh();
    }
  };

  const profileActive = pathname === '/profile/me' || pathname.startsWith('/profile/');

  return (
    <>
      <aside
        ref={railRef}
        aria-label={t('Основная навигация')}
        className="fixed inset-y-0 left-0 z-40 hidden w-[72px] flex-col items-center border-r border-[#262626] bg-black px-2 pb-5 pt-6 lg:flex"
      >
        <Link
          href="/feed"
          onClick={closeMenus}
          aria-label={t('Instagram — на главную')}
          className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl text-white transition-transform hover:scale-110"
        >
          <Logo showWordmark={false} iconClassName="h-7 w-7 rounded-[9px]" />
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {PRIMARY_NAV_ITEMS.map((item) => (
            <RailLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isActivePath(pathname, item.href)}
              onNavigate={closeMenus}
            />
          ))}

          <button
            type="button"
            onClick={() => {
              setMoreOpen(false);
              setNotificationsOpen((value) => !value);
            }}
            aria-expanded={notificationsOpen}
            aria-controls="notifications-panel"
            className={cn(ROW, notificationsOpen ? 'font-bold' : 'font-normal')}
          >
            <span className={ICON_BOX}>
              <Heart
                className={cn('h-6 w-6', notificationsOpen && 'fill-current')}
                strokeWidth={notificationsOpen ? 2.6 : 2}
                aria-hidden="true"
              />
            </span>
            <span className={LABEL}>{t('Уведомления')}</span>
          </button>

          <RailLink
            href={CREATE_NAV_ITEM.href}
            label={CREATE_NAV_ITEM.label}
            icon={CREATE_NAV_ITEM.icon}
            active={isActivePath(pathname, CREATE_NAV_ITEM.href)}
            onNavigate={closeMenus}
          />

          <Link
            href="/profile/me"
            onClick={closeMenus}
            aria-current={profileActive ? 'page' : undefined}
            className={cn(ROW, profileActive ? 'font-bold' : 'font-normal')}
          >
            <span className={ICON_BOX}>
              <Avatar
                src={profile?.avatar}
                name={profile?.fullName || profile?.userName}
                size="xs"
                className={cn(profileActive && 'ring-2 ring-foreground')}
              />
            </span>
            <span className={LABEL}>{t('Профиль')}</span>
          </Link>
        </nav>

        <div className="relative">
          {moreOpen ? (
            <MoreMenu
              onNavigate={closeMenus}
              onLogout={handleLogout}
            />
          ) : null}

          <button
            type="button"
            onClick={() => {
              setNotificationsOpen(false);
              setMoreOpen((value) => !value);
            }}
            aria-haspopup="menu"
            aria-expanded={moreOpen}
            className={cn(ROW, moreOpen ? 'font-bold' : 'font-normal')}
          >
            <span className={ICON_BOX}>
              <Menu className="h-6 w-6" strokeWidth={moreOpen ? 2.6 : 2} aria-hidden="true" />
            </span>
            <span className={LABEL}>{t('Ещё')}</span>
          </button>
        </div>
      </aside>

      {notificationsOpen ? (
        <NotificationsPanel panelRef={panelRef} onClose={closeMenus} />
      ) : null}
    </>
  );
}

function RailLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onNavigate: () => void;
}) {
  const t = useT();

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(ROW, active ? 'font-bold' : 'font-normal')}
    >
      <span className={ICON_BOX}>
        <Icon className="h-6 w-6" strokeWidth={active ? 2.6 : 2} aria-hidden="true" />
      </span>
      <span className={LABEL}>{t(label)}</span>
    </Link>
  );
}

const MENU_ITEM =
  'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-foreground transition-colors hover:bg-surface-muted';

/** Pop-up opened by the "Ещё" button: settings, saved, stories, theme, logout. */
function MoreMenu({
  onNavigate,
  onLogout,
}: {
  onNavigate: () => void;
  onLogout: () => void;
}) {
  const t = useT();
  const { locale, setLocale } = useLocale();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const next = dark ? 'light' : 'dark';
    applyTheme(next);
    writeThemeCookie(next);
    setDark(!dark);
  };

  return (
    <div
      role="menu"
      aria-label={t('Дополнительно')}
      className="absolute bottom-full left-0 mb-2 w-[236px] rounded-2xl border border-border bg-surface-raised p-2 shadow-popover"
    >
      <Link href="/profile/me/edit" role="menuitem" onClick={onNavigate} className={MENU_ITEM}>
        <Settings className="h-5 w-5" aria-hidden="true" />
        {t('Настройки профиля')}
      </Link>
      <Link href="/settings/password" role="menuitem" onClick={onNavigate} className={MENU_ITEM}>
        <KeyRound className="h-5 w-5" aria-hidden="true" />
        {t('Сменить пароль')}
      </Link>
      <Link href="/saved" role="menuitem" onClick={onNavigate} className={MENU_ITEM}>
        <Bookmark className="h-5 w-5" aria-hidden="true" />
        {t('Сохранённое')}
      </Link>
      <Link href="/stories" role="menuitem" onClick={onNavigate} className={MENU_ITEM}>
        <CirclePlay className="h-5 w-5" aria-hidden="true" />
        {t('Истории')}
      </Link>
      <button type="button" role="menuitem" onClick={toggleTheme} className={MENU_ITEM}>
        {dark ? (
          <Sun className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Moon className="h-5 w-5" aria-hidden="true" />
        )}
        {dark ? t('Светлая тема') : t('Тёмная тема')}
      </button>
      <div role="group" aria-label={t('Язык')} className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground">
        <Languages className="h-5 w-5" aria-hidden="true" />
        <span className="flex-1">{t('Язык')}</span>
        <div className="flex overflow-hidden rounded-lg border border-border">
          {(['ru', 'en'] as const).map((code) => (
            <button
              key={code}
              type="button"
              role="menuitemradio"
              aria-checked={locale === code}
              onClick={() => setLocale(code)}
              className={cn(
                'px-3 py-1 text-xs font-semibold transition-colors',
                locale === code
                  ? 'bg-foreground text-background'
                  : 'text-foreground hover:bg-surface-muted',
              )}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="my-1 h-px bg-border" role="separator" />
      <button type="button" role="menuitem" onClick={onLogout} className={MENU_ITEM}>
        <LogOut className="h-5 w-5" aria-hidden="true" />
        {t('Выйти')}
      </button>
    </div>
  );
}
