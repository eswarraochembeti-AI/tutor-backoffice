
'use client';

import { useState, type ComponentProps } from 'react';
import { useRouter } from 'next/navigation';
import BillForm from '@/components/BillForm';
import PageHeader from '@/components/PageHeader';
import { ApiError, createBill } from '@/lib/api';

type BillFormValues = Parameters<ComponentProps<typeof BillForm>['onSubmit']>[0];

const DECIMAL_PATTERN = /^\d+(\.\d{1,2})?$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function validateBill(values: BillFormValues): string | null {
  const title = String(values.title ?? '').trim();
  const amountText = String(values.amount ?? '').trim();
  const dueDate = String(values.dueDate ?? '').trim();
  const details = String(values.details ?? '');

  if (!title) return 'Please enter a title for this bill.';
  if (!amountText) return 'Enter the bill amount.';
  const amount = Number(amountText);
  if (!Number.isFinite(amount) || amount <= 0) return 'Bill amount must be greater than 0.';
  if (!DECIMAL_PATTERN.test(amountText)) return 'Enter an amount with no more than two decimal places.';
  if (!dueDate) return 'Choose a due date for this bill.';
  if (!DATE_PATTERN.test(dueDate) || Number.isNaN(Date.parse(dueDate))) return 'Enter a valid due date.';
  if (details.length > 500) return 'Bill details must be 500 characters or fewer.';
  return null;
}

export default function NewBillPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(values: BillFormValues) {
    const message = validateBill(values);
    if (message) {
      setServerError(message);
      return;
    }

    setIsSubmitting(true);
    setServerError(null);
    try {
      await createBill({
        title: String(values.title).trim(),
        amount: Number(String(values.amount).trim()),
        dueDate: String(values.dueDate).trim(),
        details: String(values.details ?? '').trim() || undefined,
      });
      router.push('/bills');
    } catch (e) {
      setServerError(e instanceof ApiError ? e.message : 'Could not save the bill. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <main data-nexen-component="nx_app_bills_new_page" className="mx-auto min-h-screen w-full min-w-0 max-w-xl space-y-6 bg-background p-4 text-foreground sm:p-6" data-nexen-id="nx-e226df7a-0">
      <PageHeader
        title="New bill"
        subtitle="Add a bill so it counts as cash out in the forecast."
        actions={null}
        className=""
      />
      <div className="w-full min-w-0 rounded-[var(--radius)] border bg-card p-4 shadow-sm sm:p-6">
        <BillForm
          initialValues={{}}
          submitLabel="Save bill"
          isSubmitting={isSubmitting}
          serverError={serverError}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/bills')}
        />
      </div>
    </main>
  );
}