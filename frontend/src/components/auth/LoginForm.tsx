'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { AuthFormCard } from './AuthFormCard';
import { Input } from '@/components/ui/Input';
import { useLoginMutation } from '@/features/account/accountApi';
import { igApi } from '@/store/api/baseApi';
import { useAppDispatch } from '@/store/hooks';
import { safeRedirectPath } from '@/lib/utils';
import { useT } from '@/lib/i18n/LocaleProvider';
import { tr } from '@/lib/i18n/core';

const loginSchema = z.object({
  userName: z.string().trim().min(1, tr('Введите имя пользователя или e-mail')),
  password: z.string().min(1, tr('Введите пароль')),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = safeRedirectPath(searchParams.get('redirect'));
  const dispatch = useAppDispatch();

  const [login, { isLoading, error }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailMode, setIsEmailMode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { userName: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values).unwrap();
      // Drop everything cached for a previous account.
      dispatch(igApi.util.resetApiState());
      router.replace(redirect);
      router.refresh();
    } catch {
      // The error is rendered from the mutation state below.
    }
  });

  if (isEmailMode) {
    return (
      <AuthFormCard
        title={t('Вход по Email')}
        description={t('Введите ваш электронный адрес и пароль от аккаунта для быстрого входа.')}
        error={error?.message}
      >
        <form onSubmit={onSubmit} noValidate className="space-y-3.5">
          <Input
            type="email"
            placeholder={t('Электронный адрес')}
            autoComplete="email"
            aria-label={t('Электронный адрес')}
            error={t(errors.userName?.message)}
            {...register('userName')}
          />

          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder={t('Пароль')}
            autoComplete="current-password"
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
            {...register('password')}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 sm:py-3 bg-[#0095F6] hover:bg-[#1877F2] active:bg-[#0081d6] text-white font-semibold text-[14px] rounded-[12px] transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              t('Войти по Email')
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setIsEmailMode(false)}
            className="text-xs sm:text-[13px] font-medium text-neutral-600 hover:text-neutral-950 transition"
          >
            {t('← Вернуться к обычному входу')}
          </button>
        </div>
      </AuthFormCard>
    );
  }

  return (
    <AuthFormCard title={t('Войти в Instagram')} error={error?.message}>
      <form onSubmit={onSubmit} noValidate className="space-y-3.5">
        <Input
          placeholder={t('Имя пользователя, номер мобильного телефона или электронный адрес...')}
          autoComplete="username"
          aria-label={t('Имя пользователя, номер мобильного телефона или электронный адрес')}
          error={t(errors.userName?.message)}
          {...register('userName')}
        />

        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder={t('Пароль')}
          autoComplete="current-password"
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
          {...register('password')}
        />

        {/* Primary Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 sm:py-3 bg-[#0095F6] hover:bg-[#1877F2] active:bg-[#0081d6] text-white font-semibold text-[14px] rounded-[12px] transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-none flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            t('Войти')
          )}
        </button>
      </form>

      {/* Forgot password link */}
      <div className="text-center my-4">
        <Link
          href="/forgot-password"
          className="text-xs sm:text-[13px] font-normal text-neutral-800 hover:text-neutral-500 transition"
        >
          {t('Забыли пароль?')}
        </Link>
      </div>

      {/* Login with Email button (Requested explicitly instead of Facebook) */}
      <div className="mb-3.5">
        <button
          type="button"
          onClick={() => setIsEmailMode(true)}
          className="w-full py-2.5 sm:py-3 bg-[#F0F2F5] hover:bg-[#E4E6EB] active:bg-[#D8DADF] text-neutral-800 font-semibold text-[14px] rounded-[12px] transition flex items-center justify-center gap-2.5"
        >
          <Mail className="h-4 w-4 text-neutral-700" aria-hidden="true" />
          <span>{t('Войти с Email')}</span>
        </button>
      </div>

      {/* Create New Account button */}
      <div>
        <Link
          href="/register"
          className="w-full py-2.5 sm:py-3 border border-[#0095F6] text-[#0095F6] hover:bg-[#0095F6]/5 active:bg-[#0095F6]/10 font-semibold text-[14px] rounded-[12px] transition flex items-center justify-center text-center"
        >
          {t('Создать новый аккаунт')}
        </Link>
      </div>
    </AuthFormCard>
  );
}
