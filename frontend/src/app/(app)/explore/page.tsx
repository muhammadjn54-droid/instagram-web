import { Suspense } from 'react';
import type { Metadata } from 'next';

import { ExploreView } from '@/components/feed/ExploreView';

export const metadata: Metadata = {
  title: 'Интересное',
};

export default function ExplorePage() {
  return (
    <Suspense fallback={null}>
      <ExploreView />
    </Suspense>
  );
}
