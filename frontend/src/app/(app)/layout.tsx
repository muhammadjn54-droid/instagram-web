import { AppShell } from '@/components/layout/AppShell';

/**
 * Layout of every authenticated screen.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
