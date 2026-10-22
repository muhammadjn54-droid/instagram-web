'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

type ToastTone = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLES: Record<ToastTone, { icon: ReactNode; className: string }> = {
  success: {
    icon: <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />,
    className: 'border-success/30 bg-success-muted text-success',
  },
  error: {
    icon: <XCircle className="h-4 w-4 text-destructive" aria-hidden="true" />,
    className: 'border-destructive/30 bg-destructive-muted text-destructive',
  },
  info: {
    icon: <Info className="h-4 w-4 text-accent" aria-hidden="true" />,
    className: 'border-accent/30 bg-accent-muted text-accent',
  },
};

/**
 * Lightweight toast provider.
 *
 * Implemented in-house (no extra dependency) because the application only
 * needs a single queue of short-lived status messages.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      const id = Date.now() + Math.random();
      setItems((current) => [...current, { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 5000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {typeof document !== 'undefined'
        ? createPortal(
            <div
              role="region"
              aria-label="Уведомления"
              className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6"
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  role="status"
                  aria-live="polite"
                  className={cn(
                    'pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-card border px-4 py-3',
                    'text-sm shadow-popover animate-fade-in',
                    TONE_STYLES[item.tone].className,
                  )}
                >
                  {TONE_STYLES[item.tone].icon}
                  <p className="flex-1 leading-snug text-foreground">{item.message}</p>
                  <button
                    type="button"
                    onClick={() => dismiss(item.id)}
                    aria-label="Закрыть уведомление"
                    className="rounded-control p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}

/** Returns the toast helper. Throws when used outside of `ToastProvider`. */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return context;
}
