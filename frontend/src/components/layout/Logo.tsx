import { cn } from '@/lib/utils';

/**
 * Instagram-style wordmark.
 *
 * The mark is drawn with CSS instead of an external asset so that it always
 * matches the current theme and never depends on a third-party licence.
 */
export function Logo({
  className,
  iconClassName,
  showWordmark = true,
}: {
  className?: string;
  iconClassName?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'relative flex h-8 w-8 items-center justify-center rounded-[10px]',
          'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]',
          iconClassName,
        )}
      >
        <span className="absolute inset-[3px] rounded-[7px] border-2 border-white/90" />
        <span className="h-2.5 w-2.5 rounded-full border-2 border-white/90" />
        <span className="absolute right-[5px] top-[5px] h-1 w-1 rounded-full bg-white/90" />
      </span>

      {showWordmark ? (
        <span className="text-lg font-bold tracking-tight text-foreground">Instagram</span>
      ) : null}
    </span>
  );
}
