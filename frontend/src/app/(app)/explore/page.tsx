import { Suspense } from 'react';
import type { Metadata } from 'next';

import { ExploreView } from '@/components/feed/ExploreView';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t('Интересное') };
}

export default function ExplorePage() {
  return (
    <Suspense fallback={null}>
      <ExploreView />
    </Suspense>
  );
}
