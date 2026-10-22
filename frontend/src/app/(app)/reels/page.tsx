import { Suspense } from 'react';
import type { Metadata } from 'next';

import { ReelsView } from '@/components/feed/ReelsView';

export const metadata: Metadata = {
  title: 'Reels',
};

export default function ReelsPage() {
  return (
    <Suspense fallback={null}>
      <ReelsView />
    </Suspense>
  );
}
