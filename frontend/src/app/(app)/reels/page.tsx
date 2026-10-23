import { Suspense } from 'react';
import type { Metadata } from 'next';

import { ReelsView } from '@/components/feed/ReelsView';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t('Reels') };
}

export default function ReelsPage() {
  return (
    <Suspense fallback={null}>
      <ReelsView />
    </Suspense>
  );
}
