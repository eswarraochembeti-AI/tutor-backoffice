'use client';

import { useState, type FormEvent } from 'react';

export type BillFormValues = {
  title: string;
  amount: number;
  dueDate: string;
  details: string;
};

type BillFormProps = {
  initialValues?: Partial<BillFormValues>;
  submitLabel?: string;
  isSubmitting?: boolean;
  serverError?: string | null;
  onSubmit: (values: BillFormValues) => void | Promise<void>;
  onCancel?: () => void;
};

type FormErrors = Partial<Record<'amount' | 'dueDate' | 'details', string>>;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DETAILS_MAX = 500;

const inputClass =
  'w-full min-w-0 rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring';
const labelClass = 'block text-sm font-medium text-foreground';
const errorClass = 'mt-1 text-xs text-destructive';

function isValidCalendarDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function validateFields(amountText: string, dueDate: string, details: string): FormErrors {
  const errors: FormErrors = {};
  const amountTrimmed = amountText.trim();

  if (!amountTrimmed) {
    errors.amount = 'Enter the bill amount.';
  } else {
    const amount = Number(amountTrimmed);
    if (Number.isNaN(amount)) {
      errors.amount = 'Enter the bill amount.';
    } else if (amount <= 0) {
      errors.amount = 'Bill amount must be greater than 0.';
    } else if (/\.\d{3,}$/.test(amountTrimmed)) {
      errors.amount = 'Enter an amount with no more than two decimal places.';
    }
  }

  if (!dueDate) {
    errors.dueDate = 'Choose a due date for this bill.';
  } else if (!isValidCalendarDate(dueDate)) {
    errors.dueDate = 'Enter a valid due date.';
  }

  if (details.length > DETAILS_MAX) {
    errors.details = 'Bill details must be 500 characters or fewer.';
  }

  return errors;
}

export default function BillForm({
  initialValues,
  submitLabel = 'Save bill',
  isSubmitting = false,
  serverError,
  onSubmit,
  onCancel,
}: BillFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [amount, setAmount] = useState(
    initialValues?.amount !== undefined ? String(initialValues.amount) : '',
  );
  const [dueDate, setDueDate] = useState(initialValues?.dueDate ?? '');
  const [details, setDetails] = useState(initialValues?.details ?? '');
  const [errors, setErrors] = useState<FormErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateFields(amount, dueDate, details);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    await onSubmit({
      title: title.trim(),
      amount: Number(amount.trim()),
      dueDate,
      details: details.trim(),
    });
  }

  return (
    <form data-nexen-component="nx_components_BillForm"
      onSubmit={handleSubmit}
      noValidate
      className="w-full max-w-xl space-y-5 rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm"
     data-nexen-id="nx-e63f4bbc-0">
      <div>
        <label htmlFor="bill-title" className={labelClass} data-nexen-id="nx-e63f4bbc-1">
          Title
        </label>
        <input
          id="bill-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Venue rent"
          className={`${inputClass} mt-1`}
         data-nexen-id="nx-e63f4bbc-2"/>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor="bill-amount" className={labelClass} data-nexen-id="nx-e63f4bbc-3">
            Amount
          </label>
          <input
            id="bill-amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            aria-invalid={Boolean(errors.amount)}
            className={`${inputClass} mt-1`}
           data-nexen-id="nx-e63f4bbc-4"/>
          {errors.amount && <p className={errorClass} data-nexen-id="nx-e63f4bbc-5">{errors.amount}</p>}
        </div>

        <div className="min-w-0">
          <label htmlFor="bill-due-date" className={labelClass} data-nexen-id="nx-e63f4bbc-6">
            Due date
          </label>
          <input
            id="bill-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            aria-invalid={Boolean(errors.dueDate)}
            className={`${inputClass} mt-1`}
           data-nexen-id="nx-e63f4bbc-7"/>
          {errors.dueDate && <p className={errorClass} data-nexen-id="nx-e63f4bbc-8">{errors.dueDate}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="bill-details" className={labelClass} data-nexen-id="nx-e63f4bbc-9">
          Details <span className="text-muted-foreground" data-nexen-id="nx-e63f4bbc-10">(optional)</span>
        </label>
        <textarea
          id="bill-details"
          rows={4}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          aria-invalid={Boolean(errors.details)}
          className={`${inputClass} mt-1 resize-y`}
         data-nexen-id="nx-e63f4bbc-11"/>
        <div className="mt-1 flex items-start justify-between gap-2 text-xs text-muted-foreground">
          {errors.details ? (
            <p className="text-destructive" data-nexen-id="nx-e63f4bbc-12">{errors.details}</p>
          ) : (
            <span  data-nexen-id="nx-e63f4bbc-13"/>
          )}
          <span data-nexen-id="nx-e63f4bbc-14">
            {details.length}/{DETAILS_MAX}
          </span>
        </div>
      </div>

      {serverError && (
        <p role="alert" className="rounded-[var(--radius)] bg-destructive/10 p-3 text-sm text-destructive" data-nexen-id="nx-e63f4bbc-15">
          {serverError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-[var(--radius)] border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-background disabled:opacity-50"
           data-nexen-id="nx-e63f4bbc-16">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-[var(--radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50"
         data-nexen-id="nx-e63f4bbc-17">
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}