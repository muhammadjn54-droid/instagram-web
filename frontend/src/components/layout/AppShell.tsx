import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { TopBar } from './TopBar';
import { SessionGuard } from './SessionGuard';

/**
 * Application shell used by every authenticated route group.
 *
 * It is a **static** Server Component: no runtime API is read here, because
 * Next.js 16 with Cache Components forbids uncached reads outside a
 * `<Suspense>` boundary. Authentication is enforced by `src/proxy.ts`, and
 * the current user is loaded in the browser through RTK Query.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <SessionGuard />

      <Sidebar />

      <div className="flex min-h-dvh flex-col lg:pl-[72px]">
        <TopBar />

        <main className="flex-1 pb-20 lg:pb-10">{children}</main>
      </div>

      <MobileNav />
    </div>
  );
}
