
'use client';

import { useEffect, useState } from 'react';

export type BillingPeriodValue = {
  billingMonth: string;
  dueDate: string;
};

type BillingPeriodPickerProps = {
  billingMonth?: string;
  dueDate?: string;
  onChange?: (value: BillingPeriodValue) => void;
};

const DEFAULT_DUE_DAYS = 14;

function firstOfMonth(yearMonth: string): string {
  return `${yearMonth}-01`;
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export default function BillingPeriodPicker({
  billingMonth,
  dueDate,
  onChange,
}: BillingPeriodPickerProps) {
  const [month, setMonth] = useState<string>(billingMonth ?? '');
  const [due, setDue] = useState<string>(dueDate ?? '');

  // Defaults are computed after mount to keep server and client markup identical.
  useEffect(() => {
    const initialMonth = billingMonth || new Date().toISOString().slice(0, 7);
    const initialDue = dueDate || addDays(firstOfMonth(initialMonth), DEFAULT_DUE_DAYS);
    setMonth(initialMonth);
    setDue(initialDue);
    // Run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (billingMonth !== undefined) setMonth(billingMonth);
  }, [billingMonth]);

  useEffect(() => {
    if (dueDate !== undefined) setDue(dueDate);
  }, [dueDate]);

  function emit(nextMonth: string, nextDue: string) {
    setMonth(nextMonth);
    setDue(nextDue);
    onChange?.({ billingMonth: nextMonth, dueDate: nextDue });
  }

  function handleMonthChange(value: string) {
    if (!value) {
      emit('', due);
      return;
    }
    const start = firstOfMonth(value);
    // Keep the due date sensible: if it now falls before the billing month, move it.
    const nextDue = !due || due < start ? addDays(start, DEFAULT_DUE_DAYS) : due;
    emit(value, nextDue);
  }

  function handleDueChange(value: string) {
    emit(month, value);
  }

  const hasMonth = month !== '';
  const dueBeforeMonth = hasMonth && due !== '' && due < firstOfMonth(month);
  const minDue = hasMonth ? firstOfMonth(month) : undefined;

  return (
    <section data-nexen-component="nx_components_BillingPeriodPicker"
      aria-labelledby="billing-period-heading"
      className="min-w-0 space-y-4 rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm sm:p-6"
     data-nexen-id="nx-f7cbaf55-0">
      <div className="min-w-0">
        <h2 id="billing-period-heading" className="text-base font-semibold text-foreground" data-nexen-id="nx-f7cbaf55-1">
          Billing period
        </h2>
        <p className="mt-1 text-sm text-muted-foreground" data-nexen-id="nx-f7cbaf55-2">
          Choose the month being billed and when the invoices are due.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex min-w-0 flex-col gap-1.5" data-nexen-id="nx-f7cbaf55-3">
          <span className="text-sm font-medium text-foreground" data-nexen-id="nx-f7cbaf55-4">Invoice month</span>
          <input
            type="month"
            name="billingMonth"
            required
            value={month}
            onChange={(event) => handleMonthChange(event.target.value)}
            className="w-full min-w-0 rounded-[var(--radius)] border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
           data-nexen-id="nx-f7cbaf55-5"/>
        </label>

        <label className="flex min-w-0 flex-col gap-1.5" data-nexen-id="nx-f7cbaf55-6">
          <span className="text-sm font-medium text-foreground" data-nexen-id="nx-f7cbaf55-7">Due date</span>
          <input
            type="date"
            name="dueDate"
            required
            min={minDue}
            value={due}
            onChange={(event) => handleDueChange(event.target.value)}
            aria-invalid={dueBeforeMonth || undefined}
            aria-describedby={dueBeforeMonth ? 'due-date-error' : undefined}
            className="w-full min-w-0 rounded-[var(--radius)] border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring aria-[invalid=true]:border-destructive"
           data-nexen-id="nx-f7cbaf55-8"/>
        </label>
      </div>

      {!hasMonth && (
        <p className="text-sm text-muted-foreground" data-nexen-id="nx-f7cbaf55-9">Choose a billing month to continue.</p>
      )}

      {dueBeforeMonth && (
        <p id="due-date-error" role="alert" className="text-sm text-destructive" data-nexen-id="nx-f7cbaf55-10">
          The due date cannot be before the start of the billing month.
        </p>
      )}
    </section>
  );
}