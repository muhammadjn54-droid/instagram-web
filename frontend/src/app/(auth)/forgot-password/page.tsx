import type { Metadata } from 'next';

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t('Восстановление пароля') };
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
