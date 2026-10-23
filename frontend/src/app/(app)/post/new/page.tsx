import type { Metadata } from 'next';

import { PageHeader } from '@/components/layout/PageHeader';
import { PostCreateForm } from '@/components/post/PostCreateForm';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t('Новая публикация') };
}

export default function NewPostPage() {
  return (
    <div className="mx-auto w-full max-w-[47rem] space-y-4 px-4 py-6">
      <PageHeader
        title="Новая публикация"
        description="Добавьте изображение, описание и при желании место."
      />
      <PostCreateForm />
    </div>
  );
}
