import type { Metadata } from 'next';

import { SearchView } from '@/components/search/SearchView';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t('Поиск') };
}

export default function SearchPage() {
  return <SearchView />;
}
