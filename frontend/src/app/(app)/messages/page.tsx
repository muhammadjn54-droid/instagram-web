import type { Metadata } from 'next';

import { MessagesView } from '@/components/messages/MessagesView';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t('Сообщения') };
}

export default function MessagesPage() {
  return <MessagesView />;
}
