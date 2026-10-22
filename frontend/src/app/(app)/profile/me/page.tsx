import { Suspense } from 'react';
import type { Metadata } from 'next';

import { ProfileView } from '@/components/profile/ProfileView';

export const metadata: Metadata = {
  title: 'Мой профиль',
};

export default function MyProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileView />
    </Suspense>
  );
}
