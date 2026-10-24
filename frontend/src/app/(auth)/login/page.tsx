import { Suspense } from 'react';
import type { Metadata } from 'next';

import { LoginForm } from '@/components/auth/LoginForm';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t('Вход') };
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
