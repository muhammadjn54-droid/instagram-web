'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KeyRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { AuthFormCard } from './AuthFormCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useForgotPasswordMutation } from '@/features/account/accountApi';

const schema = z.object({
  email: z.string().trim().email('Некорректный e-mail'),
});

type Values = z.infer<typeof schema>;

/**
 * Recovery of a forgotten password.
 *
 * The backend has no mail service: `POST /account/forgot-password` answers
 * with the reset token itself. The token is therefore shown to the user
 * instead of pretending that an e-mail was sent.
 */
export function ForgotPasswordForm() {
  const router = useRouter();
  const [forgotPassword, { isLoading, error, data }] = useForgotPasswordMutation();
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const token = data?.match(/reset-token-\d+/)?.[0] ?? data ?? '';

  const onSubmit = handleSubmit(async (values) => {
    setCopied(false);
    try {
      await forgotPassword(values).unwrap();
    } catch {
      // The error is rendered from the mutation state below.
    }
  });

  const copyToken = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <AuthFormCard
      title="Не удаётся войти?"
      description="Введите e-mail, который указан в профиле, чтобы получить токен восстановления."
      error={error?.message}
      footer={
        <div className="mt-4">
          <Link
            href="/login"
            className="w-full py-2.5 sm:py-3 border border-[#0095F6] text-[#0095F6] hover:bg-[#0095F6]/5 font-semibold text-[14px] rounded-[12px] transition flex items-center justify-center text-center"
          >
            Вернуться ко входу
          </Link>
        </div>
      }
    >
      {token ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-xs leading-relaxed text-emerald-700">
            Токен восстановления создан. Сервер не отправляет письма — используйте
            токен ниже, чтобы задать новый пароль.
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2">
            <KeyRound className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden="true" />
            <code className="min-w-0 flex-1 truncate text-xs font-semibold text-neutral-900">
              {token}
            </code>
            <Button variant="ghost" size="sm" onClick={copyToken}>
              {copied ? 'Скопировано' : 'Копировать'}
            </Button>
          </div>

          <button
            type="button"
            className="w-full py-2.5 sm:py-3 bg-[#0095F6] hover:bg-[#1877F2] text-white font-semibold text-[14px] rounded-[12px] transition"
            onClick={() =>
              router.push(
                `/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(
                  getValues('email'),
                )}`,
              )
            }
          >
            Задать новый пароль
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-3.5">
          <Input
            type="email"
            placeholder="Электронный адрес"
            autoComplete="email"
            aria-label="Электронный адрес"
            error={errors.email?.message}
            {...register('email')}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 sm:py-3 bg-[#0095F6] hover:bg-[#1877F2] active:bg-[#0081d6] text-white font-semibold text-[14px] rounded-[12px] transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Получить токен восстановления'
            )}
          </button>
        </form>
      )}
    </AuthFormCard>
  );
}
