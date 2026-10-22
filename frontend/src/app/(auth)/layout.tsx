import { AuthShell } from '@/components/auth/AuthShell';

/**
 * Layout of the public (authentication) screens.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
