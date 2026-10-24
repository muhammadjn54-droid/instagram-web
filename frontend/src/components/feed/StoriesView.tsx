'use client';

import { useRef, useState } from 'react';
import { Plus } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card, EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { MediaImage } from '@/components/shared/MediaImage';
import { useToast } from '@/components/ui/Toast';
import { StoryViewer } from './StoryViewer';
import { useCreateStoryMutation, useGetStoriesQuery } from '@/features/stories/storiesApi';
import { formatCount, getErrorMessage, validateImageFile } from '@/lib/utils';
import { useT } from '@/lib/i18n/LocaleProvider';

/**
 * Stories screen: all authors and their stories.
 */
export function StoriesView() {
  const t = useT();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeUserId, setActiveUserId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading, isError, error, refetch } = useGetStoriesQuery();
  const [createStory] = useCreateStoryMutation();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const problem = validateImageFile(file);
    if (problem) {
      toast(problem, 'error');
      return;
    }

    setUploading(true);
    try {
      await createStory({ file }).unwrap();
      toast(t('История опубликована'), 'success');
    } catch (error) {
      toast(getErrorMessage(error, t('Не удалось загрузить историю')), 'error');
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return <LoadingState label={t('Загружаем истории…')} />;
  }

  if (isError) {
    return (
      <ErrorState
        title={t('Не удалось загрузить истории')}
        message={error?.message}
        onRetry={refetch}
      />
    );
  }

  const groups = data ?? [];

  return (
    <div className="mx-auto w-full max-w-[64rem] space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-foreground">{t('Истории')}</h1>

        <Button
          variant="outline"
          size="sm"
          loading={uploading}
          icon={<Plus className="h-4 w-4" />}
          onClick={() => fileInputRef.current?.click()}
        >
          {t('Добавить')}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleUpload}
        />
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={<Plus className="h-6 w-6" aria-hidden="true" />}
          title={t('Историй пока нет')}
          description={t('Поделитесь моментом — загрузите изображение в историю.')}
        />
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <Card key={group.userId} className="p-4">
              <div className="mb-3 flex items-center gap-3">
                <Avatar src={group.userAvatar} name={group.userName} size="sm" ring />
                <div>
                  <p className="text-sm font-semibold text-foreground">{group.userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {group.stories.length}{' '}
                    {group.stories.length === 1 ? t('история') : t('историй')}
                  </p>
                </div>
              </div>

              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {group.stories.map((story) => (
                  <li key={story.id}>
                    <button
                      type="button"
                      onClick={() => setActiveUserId(group.userId)}
                      className="group w-full text-left"
                    >
                      <MediaImage
                        src={story.imageUrl}
                        alt={t('История {name}', { name: group.userName })}
                        aspectClassName="aspect-[9/16] rounded-control"
                        imgClassName="transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <span className="mt-1 block text-[11px] text-muted-foreground">
                        {t('{count} просмотров', { count: formatCount(story.viewsCount) })}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}

      <StoryViewer
        groups={groups}
        activeUserId={activeUserId}
        onSelectUser={setActiveUserId}
        onClose={() => setActiveUserId(null)}
      />
    </div>
  );
}
