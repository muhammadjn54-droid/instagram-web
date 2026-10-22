'use client';

import { useState } from 'react';

import { Avatar } from '@/components/ui/Avatar';
import { useGetStoriesQuery } from '@/features/stories/storiesApi';
import { StoryViewer } from './StoryViewer';
import type { UserStoriesGroup } from '@/types';

/**
 * Horizontal tray of story authors.
 */
export function StoriesTray() {
  const { data, isLoading, isError } = useGetStoriesQuery();
  const [activeGroup, setActiveGroup] = useState<UserStoriesGroup | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 overflow-hidden py-2" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((index) => (
          <div key={index} className="flex flex-col items-center gap-1.5">
            <div className="h-16 w-16 animate-pulse rounded-pill bg-surface-muted" />
            <div className="h-2.5 w-14 animate-pulse rounded-pill bg-surface-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (isError || !data || data.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex gap-4 overflow-x-auto py-2">
        {data.map((group) => (
          <button
            key={group.userId}
            type="button"
            onClick={() => setActiveGroup(group)}
            className="flex w-20 shrink-0 flex-col items-center gap-1.5 rounded-control p-1 transition-colors hover:bg-surface-muted"
          >
            <Avatar
              src={group.userAvatar}
              name={group.userName}
              size="lg"
              ring
            />
            <span className="w-full truncate text-center text-[11px] text-foreground">
              {group.userName}
            </span>
          </button>
        ))}
      </div>

      <StoryViewer
        key={activeGroup?.userId ?? 'none'}
        group={activeGroup}
        onClose={() => setActiveGroup(null)}
      />
    </>
  );
}
