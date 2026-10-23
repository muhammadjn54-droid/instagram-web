import {
  Clapperboard,
  Compass,
  Home,
  PlusSquare,
  Search,
  Send,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Pages reachable from the sidebar, in display order.
 *
 * Notifications (a panel) and Profile (needs the signed-in user's avatar) are
 * rendered by `Sidebar` itself; saved posts, stories, settings and logout live
 * in its "More" menu.
 */
export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: '/feed', label: 'Главная', icon: Home },
  { href: '/reels', label: 'Reels', icon: Clapperboard },
  { href: '/messages', label: 'Сообщения', icon: Send },
  { href: '/search', label: 'Поиск', icon: Search },
  { href: '/explore', label: 'Интересное', icon: Compass },
];

export const CREATE_NAV_ITEM: NavItem = {
  href: '/post/new',
  label: 'Создать',
  icon: PlusSquare,
};

/** `true` when `pathname` belongs to the given route. */
export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
