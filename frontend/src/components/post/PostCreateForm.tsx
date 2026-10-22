'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, MapPin, X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/States';
import { Input, Textarea } from '@/components/ui/Input';
import { MediaImage } from '@/components/shared/MediaImage';
import { useToast } from '@/components/ui/Toast';
import { useCreatePostMutation } from '@/features/posts/postsApi';
import { useGetLocationsQuery } from '@/features/locations/locationsApi';

const MAX_IMAGES = 10;

/**
 * Composer of a new publication.
 */
export function PostCreateForm() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [locationId, setLocationId] = useState<number | ''>('');
  const [isReel, setIsReel] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const { data: locations } = useGetLocationsQuery({ pageNumber: 1, pageSize: 50 });
  const [createPost, { isLoading }] = useCreatePostMutation();

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const selected = Array.from(fileList).slice(0, MAX_IMAGES - files.length);
    if (selected.length === 0) return;

    setFiles((current) => [...current, ...selected]);
    setPreviews((current) => [
      ...current,
      ...selected.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, position) => position !== index));
    setPreviews((current) => {
      const url = current[index];
      if (url) URL.revokeObjectURL(url);
      return current.filter((_, position) => position !== index);
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (files.length === 0) {
      toast('Добавьте хотя бы одно изображение', 'error');
      return;
    }

    try {
      const created = await createPost({
        title: title.trim() || undefined,
        content: content.trim() || undefined,
        locationId: locationId === '' ? undefined : Number(locationId),
        isReel,
        files,
      }).unwrap();

      toast('Публикация создана', 'success');
      router.push(`/post/${created.id}`);
    } catch {
      toast('Не удалось создать публикацию', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className="space-y-4 p-4 sm:p-5">
        <Input
          label="Заголовок"
          placeholder="О чём эта публикация?"
          value={title}
          maxLength={120}
          onChange={(event) => setTitle(event.target.value)}
        />

        <Textarea
          label="Описание"
          placeholder="Расскажите подробнее…"
          value={content}
          maxLength={2200}
          rows={5}
          onChange={(event) => setContent(event.target.value)}
        />

        <div className="space-y-1.5">
          <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Место
          </span>
          <div className="relative">
            <MapPin
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <select
              value={locationId}
              onChange={(event) =>
                setLocationId(event.target.value === '' ? '' : Number(event.target.value))
              }
              aria-label="Место публикации"
              className="w-full appearance-none rounded-control border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="">Без места</option>
              {locations?.items.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                  {location.city ? ` — ${location.city}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={isReel}
            onChange={(event) => setIsReel(event.target.checked)}
            className="h-4 w-4 rounded border-border-strong accent-[var(--brand)]"
          />
          Опубликовать как Reels
        </label>
      </Card>

      <Card className="space-y-3 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Изображения ({files.length}/{MAX_IMAGES})
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<ImagePlus className="h-4 w-4" />}
            onClick={() => fileInputRef.current?.click()}
            disabled={files.length >= MAX_IMAGES}
          >
            Выбрать
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = '';
          }}
        />

        {previews.length > 0 ? (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {previews.map((preview, index) => (
              <li key={preview} className="relative">
                <MediaImage
                  src={preview}
                  alt={`Предпросмотр ${index + 1}`}
                  aspectClassName="aspect-square rounded-control"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  aria-label={`Удалить изображение ${index + 1}`}
                  className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-pill bg-foreground text-background shadow-popover"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-control border border-dashed border-border px-4 py-8 text-center text-xs text-muted-foreground">
            Изображения пока не выбраны
          </p>
        )}
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Отмена
        </Button>

        <Button type="submit" loading={isLoading}>
          Опубликовать
        </Button>
      </div>
    </form>
  );
}
