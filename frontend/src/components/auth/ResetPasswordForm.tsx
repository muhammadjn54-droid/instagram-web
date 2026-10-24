'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { AuthFormCard } from './AuthFormCard';
import { Input } from '@/components/ui/Input';
import { useResetPasswordMutation } from '@/features/account/accountApi';
import { useT } from '@/lib/i18n/LocaleProvider';
import { tr } from '@/lib/i18n/core';

const schema = z
  .object({
    token: z.string().trim().min(1, tr('Укажите токен восстановления')),
    email: z.string().trim().email(tr('Некорректный e-mail')),
    password: z.string().min(6, tr('Минимум 6 символов')),
    confirmPassword: z.string().min(6, tr('Минимум 6 символов')),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: tr('Пароли не совпадают'),
    path: ['confirmPassword'],
  });

type Values = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [resetPassword, { isLoading, error, isSuccess }] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      token: searchParams.get('token') ?? '',
      email: searchParams.get('email') ?? '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await resetPassword(values).unwrap();
      router.replace('/login');
      router.refresh();
    } catch {
      // The error is rendered from the mutation state below.
    }
  });

  return (
    <AuthFormCard
      title={t('Новый пароль')}
      description={t('Введите токен восстановления и задайте новый пароль.')}
      error={error?.message}
      success={isSuccess ? t('Пароль обновлён. Перенаправляем ко входу…') : undefined}
      footer={
        <div className="mt-4">
          <Link
            href="/login"
            className="w-full py-2.5 sm:py-3 border border-[#0095F6] text-[#0095F6] hover:bg-[#0095F6]/5 font-semibold text-[14px] rounded-[12px] transition flex items-center justify-center text-center"
          >
            {t('Вернуться ко входу')}
          </Link>
        </div>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-3.5">
        <Input
          placeholder={t('Токен восстановления')}
          aria-label={t('Токен восстановления')}
          error={t(errors.token?.message)}
          {...register('token')}
        />

        <Input
          type="email"
          placeholder={t('Электронный адрес')}
          autoComplete="email"
          aria-label={t('Электронный адрес')}
          error={t(errors.email?.message)}
          {...register('email')}
        />

        <Input
          type="password"
          placeholder={t('Новый пароль (минимум 6 символов)')}
          autoComplete="new-password"
          aria-label={t('Новый пароль')}
          error={t(errors.password?.message)}
          {...register('password')}
        />

        <Input
          type="password"
          placeholder={t('Подтверждение пароля')}
          autoComplete="new-password"
          aria-label={t('Подтверждение пароля')}
          error={t(errors.confirmPassword?.message)}
          {...register('confirmPassword')}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 sm:py-3 bg-[#0095F6] hover:bg-[#1877F2] active:bg-[#0081d6] text-white font-semibold text-[14px] rounded-[12px] transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-none flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            t('Сохранить пароль')
          )}
        </button>
      </form>
    </AuthFormCard>
  );
}
