'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { ApiError, createInvoiceMarkPaid } from '@/lib/api';

interface MarkPaidFormProps {
  invoiceId: string;
  defaultAmount: number | string;
  onPaid?: () => void;
  onCancel?: () => void;
}

function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function MarkPaidForm({
  invoiceId,
  defaultAmount,
  onPaid,
  onCancel,
}: MarkPaidFormProps) {
  const [paidAt, setPaidAt] = useState('');
  const [amount, setAmount] = useState(String(defaultAmount ?? ''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Set today's date on the client only, to avoid server/client hydration mismatch.
  useEffect(() => {
    setPaidAt(toDateInputValue(new Date()));
  }, []);

  useEffect(() => {
    setAmount(String(defaultAmount ?? ''));
  }, [defaultAmount]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const paidAmount = Number(amount);
    if (!paidAt) {
      setFormError('Please choose the payment date.');
      return;
    }
    if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
      setFormError('Enter an amount greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createInvoiceMarkPaid(invoiceId, {
        paid_at: paidAt,
        paid_amount: paidAmount,
      });
      onPaid?.();
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'Could not mark this invoice as paid. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form data-nexen-component="nx_components_MarkPaidForm"
      onSubmit={handleSubmit}
      className="w-full max-w-md space-y-4 rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm sm:p-6"
      noValidate
     data-nexen-id="nx-a95ddb7b-0">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-foreground" data-nexen-id="nx-a95ddb7b-1">Mark as paid</h2>
        <p className="mt-1 text-sm text-muted-foreground" data-nexen-id="nx-a95ddb7b-2">
          Confirm when and how much was received.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="paid-at" className="block text-sm font-medium text-foreground" data-nexen-id="nx-a95ddb7b-3">
          Payment date
        </label>
        <input
          id="paid-at"
          name="paidAt"
          type="date"
          value={paidAt}
          onChange={(e) => setPaidAt(e.target.value)}
          disabled={isSubmitting}
          required
          className="w-full min-w-0 rounded-[var(--radius)] border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
         data-nexen-id="nx-a95ddb7b-4"/>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="paid-amount" className="block text-sm font-medium text-foreground" data-nexen-id="nx-a95ddb7b-5">
          Amount received
        </label>
        <input
          id="paid-amount"
          name="paidAmount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isSubmitting}
          required
          className="w-full min-w-0 rounded-[var(--radius)] border border-input bg-background px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
         data-nexen-id="nx-a95ddb7b-6"/>
      </div>

      {formError && (
        <p role="alert" className="rounded-[var(--radius)] bg-destructive/10 px-3 py-2 text-sm text-destructive" data-nexen-id="nx-a95ddb7b-7">
          {formError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full rounded-[var(--radius)] border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground disabled:opacity-60 sm:w-auto"
           data-nexen-id="nx-a95ddb7b-8">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-[var(--radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:opacity-60 sm:w-auto"
         data-nexen-id="nx-a95ddb7b-9">
          {isSubmitting ? 'Saving…' : 'Mark as paid'}
        </button>
      </div>
    </form>
  );
}