import type { Metadata } from 'next';

import { PageHeader } from '@/components/layout/PageHeader';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';

export const metadata: Metadata = {
  title: 'Редактирование профиля',
};

export default function EditProfilePage() {
  return (
    <div className="mx-auto w-full max-w-[47rem] space-y-4 px-4 py-6">
      <PageHeader
        title="Редактирование профиля"
        description="Обновите имя, описание, аватар и настройки аккаунта."
        backHref="/profile/me"
        backLabel="Назад в профиль"
      />
      <ProfileEditForm />
    </div>
  );
}
