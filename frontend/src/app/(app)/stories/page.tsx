import type { Metadata } from 'next';

import { StoriesView } from '@/components/feed/StoriesView';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t('Истории') };
}

export default function StoriesPage() {
  return <StoriesView />;
}
