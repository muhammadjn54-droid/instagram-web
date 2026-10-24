import { Suspense } from 'react';
import type { Metadata } from 'next';

import { ProfileView } from '@/components/profile/ProfileView';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t('Профиль') };
}

export default function UserProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileView />
    </Suspense>
  );
}
