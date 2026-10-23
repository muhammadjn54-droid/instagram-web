import type { Metadata } from 'next';

import { PostDetail } from '@/components/post/PostDetail';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t('Публикация') };
}

export default function PostPage() {
  return <PostDetail />;
}
