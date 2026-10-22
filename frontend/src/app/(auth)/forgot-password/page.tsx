import type { Metadata } from 'next';

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Восстановление пароля',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
