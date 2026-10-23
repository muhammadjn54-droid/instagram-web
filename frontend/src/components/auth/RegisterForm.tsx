'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { AuthFormCard } from './AuthFormCard';
import { Input } from '@/components/ui/Input';
import { useRegisterMutation } from '@/features/account/accountApi';
import { igApi } from '@/store/api/baseApi';
import { useAppDispatch } from '@/store/hooks';
import { useT } from '@/lib/i18n/LocaleProvider';
import { tr } from '@/lib/i18n/core';

const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, tr('Укажите имя и фамилию')),
    userName: z
      .string()
      .trim()
      .min(3, tr('Минимум 3 символа'))
      .regex(/^[a-zA-Z0-9._]+$/, tr('Только латиница, цифры, точка и подчёркивание')),
    email: z.string().trim().email(tr('Некорректный e-mail')),
    password: z.string().min(6, tr('Минимум 6 символов')),
    confirmPassword: z.string().min(6, tr('Минимум 6 символов')),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: tr('Пароли не совпадают'),
    path: ['confirmPassword'],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const t = useT();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [register, { isLoading, error }] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      userName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (formValues) => {
    try {
      await register(formValues).unwrap();
      dispatch(igApi.util.resetApiState());
      router.replace('/feed');
      router.refresh();
    } catch {
      // The error is rendered from the mutation state below.
    }
  });

  return (
    <AuthFormCard
      title={t('Регистрация в Instagram')}
      description={t('Зарегистрируйтесь, чтобы смотреть фото и видео ваших друзей.')}
      error={error?.message}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-3">
        <Input
          type="email"
          placeholder={t('Электронный адрес')}
          autoComplete="email"
          aria-label={t('Электронный адрес')}
          error={t(errors.email?.message)}
          {...registerField('email')}
        />

        <Input
          placeholder={t('Имя и фамилия')}
          autoComplete="name"
          aria-label={t('Имя и фамилия')}
          error={t(errors.fullName?.message)}
          {...registerField('fullName')}
        />

        <Input
          placeholder={t('Имя пользователя')}
          autoComplete="username"
          aria-label={t('Имя пользователя')}
          error={t(errors.userName?.message)}
          {...registerField('userName')}
        />

        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder={t('Пароль (минимум 6 символов)')}
          autoComplete="new-password"
          aria-label={t('Пароль')}
          error={t(errors.password?.message)}
          addon={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? t('Скрыть пароль') : t('Показать пароль')}
              className="text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          }
          {...registerField('password')}
        />

        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder={t('Подтверждение пароля')}
          autoComplete="new-password"
          aria-label={t('Подтверждение пароля')}
          error={t(errors.confirmPassword?.message)}
          {...registerField('confirmPassword')}
        />

        <p className="py-1 text-[11px] leading-normal text-neutral-400">
          {t('Регистрируясь, вы принимаете наши Условия, Политику конфиденциальности и Политику в отношении файлов cookie.')}
        </p>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 sm:py-3 bg-[#0095F6] hover:bg-[#1877F2] active:bg-[#0081d6] text-white font-semibold text-[14px] rounded-[12px] transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-none flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            t('Зарегистрироваться')
          )}
        </button>
      </form>

      {/* Have an account? Log in */}
      <div className="mt-4">
        <Link
          href="/login"
          className="w-full py-2.5 sm:py-3 border border-[#0095F6] text-[#0095F6] hover:bg-[#0095F6]/5 active:bg-[#0095F6]/10 font-semibold text-[14px] rounded-[12px] transition flex items-center justify-center text-center"
        >
          {t('Есть аккаунт? Войти')}
        </Link>
      </div>
    </AuthFormCard>
  );
}
