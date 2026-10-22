'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/States';
import { Input, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import {
  useDeleteAvatarMutation,
  useGetMyProfileQuery,
  useUpdateAvatarMutation,
  useUpdateProfileMutation,
} from '@/features/profiles/profilesApi';
import { Gender } from '@/types';

const schema = z.object({
  fullName: z.string().trim().min(2, 'Укажите имя и фамилию'),
  userName: z
    .string()
    .trim()
    .min(3, 'Минимум 3 символа')
    .regex(/^[a-zA-Z0-9._]+$/, 'Только латиница, цифры, точка и подчёркивание'),
  bio: z.string().max(300, 'Не больше 300 символов'),
  website: z.string().trim().max(200, 'Не больше 200 символов'),
  gender: z.number(),
  isPrivate: z.boolean(),
});

type Values = z.infer<typeof schema>;

/**
 * Profile editor.
 */
export function ProfileEditForm() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile } = useGetMyProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
  const [updateAvatar, { isLoading: isUploading }] = useUpdateAvatarMutation();
  const [deleteAvatar, { isLoading: isDeleting }] = useDeleteAvatarMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      userName: '',
      bio: '',
      website: '',
      gender: Gender.Male,
      isPrivate: false,
    },
  });

  useEffect(() => {
    if (!profile) return;

    reset({
      fullName: profile.fullName ?? '',
      userName: profile.userName ?? '',
      bio: profile.bio ?? '',
      website: profile.website ?? '',
      gender: profile.gender ?? Gender.Male,
      isPrivate: Boolean(profile.isPrivate),
    });
  }, [profile, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateProfile({
        fullName: values.fullName,
        userName: values.userName,
        bio: values.bio,
        website: values.website,
        gender: values.gender as Gender,
        isPrivate: values.isPrivate,
      }).unwrap();

      toast('Профиль обновлён', 'success');
      router.push('/profile/me');
      router.refresh();
    } catch {
      toast('Не удалось сохранить профиль', 'error');
    }
  });

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      await updateAvatar(file).unwrap();
      toast('Аватар обновлён', 'success');
    } catch {
      toast('Не удалось загрузить аватар', 'error');
    }
  };

  const handleAvatarDelete = async () => {
    try {
      await deleteAvatar().unwrap();
      toast('Аватар удалён', 'success');
    } catch {
      toast('Не удалось удалить аватар', 'error');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Card className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
        <div className="relative">
          <Avatar
            src={profile?.avatar}
            name={profile?.fullName ?? profile?.userName}
            size="xl"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Загрузить аватар"
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-pill bg-accent text-white shadow-popover transition-colors hover:bg-accent/90"
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 space-y-2">
          <p className="text-sm font-semibold text-foreground">Аватар</p>
          <p className="text-xs text-muted-foreground">
            PNG или JPG, до 5 МБ. Изображение будет обрезано по кругу.
          </p>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              loading={isUploading}
            >
              Загрузить
            </Button>

            {profile?.avatar ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAvatarDelete}
                loading={isDeleting}
                icon={<Trash2 className="h-4 w-4" />}
              >
                Удалить
              </Button>
            ) : null}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleAvatarChange}
        />
      </Card>

      <Card className="space-y-4 p-4 sm:p-5">
        <Input
          label="Имя и фамилия"
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label="Имя пользователя"
          error={errors.userName?.message}
          {...register('userName')}
        />

        <Textarea
          label="О себе"
          hint="До 300 символов"
          error={errors.bio?.message}
          rows={4}
          {...register('bio')}
        />

        <Input
          label="Ссылка"
          placeholder="https://example.com"
          error={errors.website?.message}
          {...register('website')}
        />

        <div className="space-y-1.5">
          <label
            htmlFor="gender"
            className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Пол
          </label>
          <select
            id="gender"
            {...register('gender', { valueAsNumber: true })}
            className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value={Gender.Male}>Мужской</option>
            <option value={Gender.Female}>Женский</option>
          </select>
        </div>

        <label className="flex items-center gap-3 text-sm text-foreground">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border-strong accent-[var(--brand)]"
            {...register('isPrivate')}
          />
          Закрытый аккаунт — публикации видят только подписчики
        </label>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSaving}>
          Отмена
        </Button>
        <Button type="submit" loading={isSaving}>
          Сохранить
        </Button>
      </div>
    </form>
  );
}
