'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/States';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useChangePasswordMutation } from '@/features/account/accountApi';
import { getErrorMessage } from '@/lib/utils';
import { useT } from '@/lib/i18n/LocaleProvider';
import { tr } from '@/lib/i18n/core';

const schema = z
  .object({
    oldPassword: z.string().min(1, tr('Введите текущий пароль')),
    password: z.string().min(6, tr('Минимум 6 символов')),
    confirmPassword: z.string().min(6, tr('Минимум 6 символов')),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: tr('Пароли не совпадают'),
    path: ['confirmPassword'],
  });

type Values = z.infer<typeof schema>;

/**
 * Password change form.
 */
export function PasswordForm() {
  const t = useT();
  const { toast } = useToast();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { oldPassword: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await changePassword(values).unwrap();
      setDone(true);
      reset();
      toast(t('Пароль обновлён'), 'success');
    } catch (error) {
      setDone(false);
      toast(getErrorMessage(error, t('Не удалось изменить пароль')), 'error');
    }
  });

  return (
    <Card className="p-4 sm:p-5">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Input
          label={t('Текущий пароль')}
          type="password"
          autoComplete="current-password"
          error={t(errors.oldPassword?.message)}
          {...register('oldPassword')}
        />

        <Input
          label={t('Новый пароль')}
          type="password"
          autoComplete="new-password"
          hint={t('Минимум 6 символов')}
          error={t(errors.password?.message)}
          {...register('password')}
        />

        <Input
          label={t('Подтверждение нового пароля')}
          type="password"
          autoComplete="new-password"
          error={t(errors.confirmPassword?.message)}
          {...register('confirmPassword')}
        />

        <div className="flex items-center gap-3">
          <Button type="submit" loading={isLoading}>
            {t('Обновить пароль')}
          </Button>

          {done ? (
            <span className="text-xs font-medium text-success">{t('Пароль обновлён')}</span>
          ) : null}
        </div>
      </form>
    </Card>
  );
}
