import { Suspense } from 'react';
import type { Metadata } from 'next';

import { SavedView } from '@/components/feed/SavedView';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t('Сохранённое') };
}

export default function SavedPage() {
  return (
    <Suspense fallback={null}>
      <SavedView />
    </Suspense>
  );
}
