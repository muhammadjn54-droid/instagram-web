import { AuthFooter } from './AuthFooter';
import { AuthHero } from './AuthHero';

/**
 * Split layout shared by every authentication screen.
 *
 * Server Component — the individual forms are client components.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col justify-between bg-white text-neutral-900 selection:bg-[#0095f6]/20">
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8 md:py-12">
        <div className="grid w-full max-w-[1080px] grid-cols-1 items-stretch lg:grid-cols-2">
          <div className="flex flex-col justify-center items-center lg:items-start lg:pr-14 lg:border-r lg:border-neutral-200">
            <AuthHero />
          </div>

          <div className="flex flex-col justify-center items-center lg:items-start lg:pl-14 pt-8 lg:pt-0">
            {children}
          </div>
        </div>
      </main>

      <AuthFooter />
    </div>
  );
}
