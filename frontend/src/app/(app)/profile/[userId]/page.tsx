import { Suspense } from 'react';
import type { Metadata } from 'next';

import { ProfileView } from '@/components/profile/ProfileView';

export const metadata: Metadata = {
  title: 'Профиль',
};

export default function UserProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileView />
    </Suspense>
  );
}
