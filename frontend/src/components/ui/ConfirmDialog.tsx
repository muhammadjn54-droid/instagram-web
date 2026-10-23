'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { Button } from './Button';
import { Dialog } from './Dialog';
import { useT } from '@/lib/i18n/LocaleProvider';
import { tr } from '@/lib/i18n/core';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

/**
 * Confirmation dialog for destructive actions.
 *
 * Focus lands on the cancel button so that a stray `Enter` never deletes
 * something.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = tr('Подтвердить'),
  cancelLabel = tr('Отмена'),
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  const t = useT();
  const [cancelRef, setCancelRef] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (open) cancelRef?.focus();
  }, [open, cancelRef]);

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button ref={setCancelRef} variant="ghost" onClick={onCancel} disabled={loading}>
            {t(cancelLabel)}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {t(confirmLabel)}
          </Button>
        </>
      }
    >
      {children}
    </Dialog>
  );
}
