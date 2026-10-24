import type { Metadata } from 'next';

import { PageHeader } from '@/components/layout/PageHeader';
import { PasswordForm } from '@/components/settings/PasswordForm';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t('Безопасность') };
}

export default function PasswordPage() {
  return (
    <div className="mx-auto w-full max-w-[47rem] space-y-4 px-4 py-6">
      <PageHeader
        title="Безопасность"
        description="Измените пароль, который используется для входа в аккаунт."
        backHref="/profile/me"
        backLabel="Назад в профиль"
      />
      <PasswordForm />
    </div>
  );
}
