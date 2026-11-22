'use client';

import { useEffect, useId } from 'react';

interface ConfirmDeleteDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDeleting?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteDialog({
  open,
  title = 'Delete this item?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDeleting = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, isDeleting, onCancel]);

  if (!open) return null;

  const handleBackdropClick = () => {
    if (!isDeleting) onCancel();
  };

  return (
    <div data-nexen-component="nx_components_ConfirmDeleteDialog"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={handleBackdropClick}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-md min-w-0 rounded-[var(--radius)] border border-border bg-card p-6 text-foreground shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-[var(--radius)] bg-destructive/10 text-destructive"
           data-nexen-id="nx-d21e5574-0">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-lg font-semibold" data-nexen-id="nx-d21e5574-1">
              {title}
            </h2>
            <p id={descriptionId} className="mt-2 break-words text-sm text-muted-foreground" data-nexen-id="nx-d21e5574-2">
              {message}
            </p>
          </div>
        </div>

        {error ? (
          <p role="alert" className="mt-4 break-words rounded-[var(--radius)] border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" data-nexen-id="nx-d21e5574-3">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="w-full rounded-[var(--radius)] border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/10 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
           data-nexen-id="nx-d21e5574-4">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full rounded-[var(--radius)] bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
           data-nexen-id="nx-d21e5574-5">
            {isDeleting ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}