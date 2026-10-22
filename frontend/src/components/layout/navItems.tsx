'use client';

import Link from 'next/link';
import {
  Bookmark,
  CirclePlay,
  Clapperboard,
  Compass,
  Home,
  MessageCircle,
  PlusSquare,
} from 'lucide-react';

import { cn } from '@/lib/utils';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/feed', label: 'Главная', icon: <Home className="h-6 w-6" /> },
  { href: '/explore', label: 'Интересное', icon: <Compass className="h-6 w-6" /> },
  { href: '/reels', label: 'Reels', icon: <Clapperboard className="h-6 w-6" /> },
  { href: '/stories', label: 'Истории', icon: <CirclePlay className="h-6 w-6" /> },
  { href: '/messages', label: 'Сообщения', icon: <MessageCircle className="h-6 w-6" /> },
  { href: '/post/new', label: 'Создать', icon: <PlusSquare className="h-6 w-6" /> },
  { href: '/saved', label: 'Сохранённое', icon: <Bookmark className="h-6 w-6" /> },
];

/** `true` when `pathname` belongs to the given navigation item. */
export function isActivePath(pathname: string, item: NavItem): boolean {
  if (item.href === '/feed') return pathname === '/feed';
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function NavLink({
  item,
  pathname,
  variant = 'sidebar',
}: {
  item: NavItem;
  pathname: string;
  variant?: 'sidebar' | 'mobile';
}) {
  const active = isActivePath(pathname, item);

  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors',
        'hover:bg-surface-muted',
        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        variant === 'mobile' && 'flex-col gap-1 px-2 py-1.5 text-[10px]',
      )}
    >
      <span aria-hidden="true">{item.icon}</span>
      <span className={cn(variant === 'mobile' && 'truncate')}>{item.label}</span>
      {active ? <span className="sr-only">(текущая страница)</span> : null}
    </Link>
  );
}
