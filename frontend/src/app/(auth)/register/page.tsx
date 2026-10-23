import type { Metadata } from 'next';

import { RegisterForm } from '@/components/auth/RegisterForm';
import { getT } from '@/lib/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t('Регистрация') };
}

export default function RegisterPage() {
  return <RegisterForm />;
}
