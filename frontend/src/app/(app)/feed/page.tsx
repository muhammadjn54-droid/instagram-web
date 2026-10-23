import { Suspense } from 'react';
import type { Metadata } from 'next';

import { FeedView } from '@/components/feed/FeedView';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t('Лента') };
}

export default function FeedPage() {
  return (
    <Suspense fallback={null}>
      <FeedView />
    </Suspense>
  );
}
