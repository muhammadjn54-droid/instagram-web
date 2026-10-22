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
import { formatCount } from '@/lib/utils';
import type { UserStoriesGroup } from '@/types';

/**
 * Stories screen: all authors and their stories.
 */
export function StoriesView() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeGroup, setActiveGroup] = useState<UserStoriesGroup | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading, isError, error, refetch } = useGetStoriesQuery();
  const [createStory] = useCreateStoryMutation();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploading(true);
    try {
      await createStory({ file }).unwrap();
      toast('История опубликована', 'success');
    } catch {
      toast('Не удалось загрузить историю', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return <LoadingState label="Загружаем истории…" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Не удалось загрузить истории"
        message={error?.message}
        onRetry={refetch}
      />
    );
  }

  const groups = data ?? [];

  return (
    <div className="mx-auto w-full max-w-[64rem] space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Истории</h1>

        <Button
          variant="outline"
          size="sm"
          loading={uploading}
          icon={<Plus className="h-4 w-4" />}
          onClick={() => fileInputRef.current?.click()}
        >
          Добавить
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleUpload}
        />
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={<Plus className="h-6 w-6" aria-hidden="true" />}
          title="Историй пока нет"
          description="Поделитесь моментом — загрузите изображение в историю."
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
                    {group.stories.length === 1 ? 'история' : 'историй'}
                  </p>
                </div>
              </div>

              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {group.stories.map((story) => (
                  <li key={story.id}>
                    <button
                      type="button"
                      onClick={() => setActiveGroup(group)}
                      className="group w-full text-left"
                    >
                      <MediaImage
                        src={story.imageUrl}
                        alt={`История ${group.userName}`}
                        aspectClassName="aspect-[9/16] rounded-control"
                        imgClassName="transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <span className="mt-1 block text-[11px] text-muted-foreground">
                        {formatCount(story.viewsCount)} просмотров
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
        key={activeGroup?.userId ?? 'none'}
        group={activeGroup}
        onClose={() => setActiveGroup(null)}
      />
    </div>
  );
}
