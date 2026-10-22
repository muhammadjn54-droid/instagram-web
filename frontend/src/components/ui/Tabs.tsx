'use client';

import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
  label?: string;
}

/**
 * Tab list following the ARIA tabs pattern.
 *
 * Arrow keys move between tabs, `Home`/`End` jump to the first/last tab.
 */
export function Tabs({ items, active, onChange, className, label = 'Разделы' }: TabsProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const index = items.findIndex((item) => item.id === active);
    if (index === -1) return;

    let nextIndex: number | null = null;

    if (event.key === 'ArrowRight') nextIndex = (index + 1) % items.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + items.length) % items.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = items.length - 1;

    if (nextIndex === null) return;

    event.preventDefault();
    onChange(items[nextIndex].id);
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex items-center gap-1 overflow-x-auto border-b border-border',
        className,
      )}
    >
      {items.map((item) => {
        const isActive = item.id === active;

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={isActive}
            aria-controls={`panel-${item.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(item.id)}
            className={cn(
              'relative shrink-0 px-4 py-3 text-xs font-semibold uppercase tracking-wide transition-colors',
              isActive
                ? 'text-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {item.label}
            {typeof item.count === 'number' ? (
              <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
