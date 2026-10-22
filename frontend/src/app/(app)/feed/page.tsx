import { Suspense } from 'react';
import type { Metadata } from 'next';

import { FeedView } from '@/components/feed/FeedView';

export const metadata: Metadata = {
  title: 'Лента',
};

export default function FeedPage() {
  return (
    <Suspense fallback={null}>
      <FeedView />
    </Suspense>
  );
}
