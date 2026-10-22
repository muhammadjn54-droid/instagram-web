import { Spinner } from '@/components/ui/States';

/**
 * Route level loading state.
 */
export default function Loading() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <Spinner className="h-6 w-6" />
      <span className="sr-only">Загрузка страницы</span>
    </div>
  );
}
