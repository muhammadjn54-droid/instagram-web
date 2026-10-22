import type { Metadata } from 'next';

import { PostDetail } from '@/components/post/PostDetail';

export const metadata: Metadata = {
  title: 'Публикация',
};

export default function PostPage() {
  return <PostDetail />;
}
