import type { Metadata } from 'next';

import { MessagesView } from '@/components/messages/MessagesView';

export const metadata: Metadata = {
  title: 'Сообщения',
};

export default function MessagesPage() {
  return <MessagesView />;
}
