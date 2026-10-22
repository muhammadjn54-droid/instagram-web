'use client';

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';

import { cn } from '@/lib/utils';

const CONTROL_BASE =
  'w-full h-11 sm:h-12 rounded-[12px] border bg-white dark:bg-surface px-3.5 text-xs sm:text-[13px] text-foreground ' +
  'placeholder:text-neutral-400 placeholder:text-xs sm:placeholder:text-[13px] ' +
  'transition-all duration-150 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400';

const CONTROL_STATE =
  'border-neutral-300 dark:border-neutral-700 focus:bg-white dark:focus:bg-surface focus:border-[#0095F6] ' +
  'focus:outline-none focus:ring-1 focus:ring-[#0095F6] ' +
  'aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:ring-1 aria-[invalid=true]:focus:ring-destructive';

export interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Label + control + hint/error wrapper.
 *
 * The error message is rendered with `role="alert"` and is referenced by the
 * control through `aria-describedby`, so screen readers announce it.
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: FieldProps) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
      >
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </label>

      {children}

      {hint && !error ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  /** Rendered inside the control, on the right (icons, buttons). */
  addon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, addon, className, id, required, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  const control = (
    <div className="relative">
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hintId}
        className={cn(
          CONTROL_BASE,
          CONTROL_STATE,
          addon ? 'pr-11' : undefined,
          className,
        )}
        {...props}
      />
      {addon ? (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {addon}
        </div>
      ) : null}
    </div>
  );

  if (!label) {
    return (
      <div className="space-y-1">
        {control}
        {error ? (
          <p id={errorId} role="alert" className="text-xs font-medium text-destructive px-1">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <Field label={label} htmlFor={inputId} hint={hint} error={error} required={required}>
      {control}
    </Field>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, hint, error, className, id, required, rows = 4, ...props }, ref) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const hintId = hint ? `${textareaId}-hint` : undefined;
    const errorId = error ? `${textareaId}-error` : undefined;

    const control = (
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hintId}
        className={cn(CONTROL_BASE, CONTROL_STATE, 'resize-y py-2.5 leading-relaxed', className)}
        {...props}
      />
    );

    if (!label) return control;

    return (
      <Field
        label={label}
        htmlFor={textareaId}
        hint={hint}
        error={error}
        required={required}
      >
        {control}
      </Field>
    );
  },
);
