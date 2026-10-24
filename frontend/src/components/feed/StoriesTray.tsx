'use client';

import { useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useGetStoriesQuery } from '@/features/stories/storiesApi';
import { StoryViewer } from './StoryViewer';
import { getMediaUrl } from '@/lib/media';

/**
 * Horizontal tray of story authors matching real Instagram.
 */
export function StoriesTray() {
  const { data, isLoading, isError } = useGetStoriesQuery();
  const [activeUserId, setActiveUserId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 overflow-hidden py-3" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <div className="h-[66px] w-[66px] animate-pulse rounded-full bg-neutral-800" />
            <div className="h-2 w-14 animate-pulse rounded-full bg-neutral-800" />
          </div>
        ))}
      </div>
    );
  }

  if (isError || !data || data.length === 0) {
    return null;
  }

  return (
    <div className="relative group">
      <div
        ref={scrollRef}
        className="flex items-center gap-4 overflow-x-auto py-2 scrollbar-none scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {data.map((group) => {
          const avatarUrl = getMediaUrl(group.userAvatar);
          return (
            <button
              key={group.userId}
              type="button"
              onClick={() => setActiveUserId(group.userId)}
              className="flex w-[72px] shrink-0 flex-col items-center gap-1.5 focus:outline-none transition-transform hover:scale-[1.03] active:scale-95"
            >
              {/* Instagram rainbow ring */}
              <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]">
                <div className="p-[2px] rounded-full bg-black">
                  <div className="h-[58px] w-[58px] rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center text-xs font-semibold text-neutral-300">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt={group.userName}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span>{group.userName.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                </div>
              </div>
              <span className="w-full truncate text-center text-[12px] text-neutral-200">
                {group.userName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Scroll right button */}
      {data.length > 5 ? (
        <button
          type="button"
          onClick={scrollRight}
          aria-label="Прокрутить вправо"
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-black shadow-md hover:bg-white hover:scale-110 active:scale-95 transition-all opacity-80 group-hover:opacity-100"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : null}

      <StoryViewer
        groups={data}
        activeUserId={activeUserId}
        onSelectUser={setActiveUserId}
        onClose={() => setActiveUserId(null)}
      />
    </div>
  );
}
