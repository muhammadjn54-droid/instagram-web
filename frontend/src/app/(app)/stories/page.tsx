import type { Metadata } from 'next';

import { StoriesView } from '@/components/feed/StoriesView';

export const metadata: Metadata = {
  title: 'Истории',
};

export default function StoriesPage() {
  return <StoriesView />;
}
