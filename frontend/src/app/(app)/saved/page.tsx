import { Suspense } from 'react';
import type { Metadata } from 'next';

import { SavedView } from '@/components/feed/SavedView';

export const metadata: Metadata = {
  title: 'Сохранённое',
};

export default function SavedPage() {
  return (
    <Suspense fallback={null}>
      <SavedView />
    </Suspense>
  );
}
