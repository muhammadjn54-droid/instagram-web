'use client';

import { AlertCircle, CheckCircle2 } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface AuthFormCardProps {
  title: string;
  description?: string;
  error?: string;
  success?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  showMetaLogo?: boolean;
}

/**
 * Shell of every authentication form: title, alert area, content and Meta branding.
 */
export function AuthFormCard({
  title,
  description,
  error,
  success,
  children,
  footer,
  className,
  showMetaLogo = true,
}: AuthFormCardProps) {
  return (
    <div className={cn('w-full max-w-[380px] sm:max-w-[400px]', className)}>
      <h1 className="mb-4 text-[20px] sm:text-[22px] font-semibold tracking-tight text-neutral-900">
        {title}
      </h1>

      {description ? (
        <p className="mb-6 text-xs sm:text-[13px] leading-relaxed text-neutral-500">
          {description}
        </p>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-relaxed text-red-600 animate-fade-in"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      {success ? (
        <div
          role="status"
          className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-700 animate-fade-in"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <span>{success}</span>
        </div>
      ) : null}

      {children}

      {footer ? <div className="mt-4">{footer}</div> : null}

      {showMetaLogo ? (
        <div className="mt-8 flex items-center justify-center gap-1.5 text-neutral-600 select-none">
          <svg
            className="h-4 w-4 text-neutral-600"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M16.99 7.23c-1.74 0-3.32.94-4.22 2.38-.9-1.44-2.48-2.38-4.22-2.38-3.04 0-5.45 2.65-4.8 5.89.5 2.47 2.67 4.38 5.17 4.38 1.93 0 3.66-1.12 4.45-2.76.79 1.64 2.52 2.76 4.45 2.76 2.5 0 4.67-1.91 5.17-4.38.65-3.24-1.76-5.89-4.8-5.89zm-8.44 8.27c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm8.88 0c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
          </svg>
          <span className="text-xs font-semibold tracking-wide text-neutral-600">Meta</span>
        </div>
      ) : null}
    </div>
  );
}
