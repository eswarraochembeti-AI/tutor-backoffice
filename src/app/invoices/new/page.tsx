'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import BillingPeriodPicker from '@/components/BillingPeriodPicker';
import StudentCheckList from '@/components/StudentCheckList';
import { ApiError, createInvoiceGenerate, getStudents } from '@/lib/api';
import type { Student } from '@/types/student';

const BILLING_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatMoney(value: number): string {
  return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}

export default function NewInvoicePage() {
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [billingMonth, setBillingMonth] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadStudents = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const list = await getStudents();
      const safeList = Array.isArray(list) ? list : [];
      setStudents(safeList);
      setSelectedIds(
        safeList.filter((s) => s.status === 'active').map((s) => s.id),
      );
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : 'Could not load students. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const safeStudents = Array.isArray(students) ? students : [];

  const selectedStudents = useMemo(
    () => safeStudents.filter((s) => selectedIds.includes(s.id)),
    [safeStudents, selectedIds],
  );

  const totalAmount = useMemo(
    () => selectedStudents.reduce((sum, s) => sum + Number(s.monthlyFee), 0),
    [selectedStudents],
  );

  const hasStudents = safeStudents.length > 0;

  const handleGenerate = async () => {
    setFormError(null);

    if (!billingMonth) {
      setFormError('Please choose a billing month.');
      return;
    }
    if (!BILLING_MONTH_PATTERN.test(billingMonth)) {
      setFormError('Enter a valid billing month (for example, 2025-03).');
      return;
    }
    if (selectedIds.length === 0) {
      setFormError('Select at least one student to invoice.');
      return;
    }
    if (!dueDate || !DATE_PATTERN.test(dueDate) || Number.isNaN(Date.parse(dueDate))) {
      setFormError('Choose a due date for these invoices.');
      return;
    }

    const payload = {
      billing_month: billingMonth,
      issued_date: todayIsoDate(),
      due_date: dueDate,
      student_ids: selectedIds,
    };

    setIsSubmitting(true);
    try {
      await createInvoiceGenerate(payload);
      router.push('/invoices');
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'Could not create invoices. Your selections are kept, so you can try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/invoices');
  };

  const checklistStudents = safeStudents.map((s) => ({
    id: s.id,
    name: s.name,
    monthlyFee: s.monthlyFee,
  }));

  return (
    <div data-nexen-component="nx_app_invoices_new_page" className="mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-6 p-4 sm:p-6">
      <PageHeader
        title="New Invoice"
        subtitle="Invoices are raised from each student's monthly fee."
        actions={null}
        className="min-w-0"
      />

      <section className="flex w-full min-w-0 flex-col gap-3 rounded-[var(--radius)] border bg-card p-4 shadow-sm sm:p-6" data-nexen-id="nx-06b2cddf-0">
        <h2 className="text-base font-semibold text-foreground" data-nexen-id="nx-06b2cddf-1">Billing period</h2>
        <BillingPeriodPicker
          billingMonth={billingMonth}
          dueDate={dueDate}
          onChange={(value) => {
            setBillingMonth(value.billingMonth);
            setDueDate(value.dueDate);
          }}
        />
      </section>

      <section className="flex w-full min-w-0 flex-col gap-3 rounded-[var(--radius)] border bg-card p-4 shadow-sm sm:p-6" data-nexen-id="nx-06b2cddf-2">
        <h2 className="text-base font-semibold text-foreground" data-nexen-id="nx-06b2cddf-3">Students to invoice</h2>

        {isLoading ? (
          <div className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
            <span
              role="status"
              aria-label="Loading students"
              className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent"
             data-nexen-id="nx-06b2cddf-4"/>
            Loading students…
          </div>
        ) : loadError ? (
          <div className="flex w-full min-w-0 flex-col gap-3 rounded-[var(--radius)] border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
            <span className="min-w-0 break-words" data-nexen-id="nx-06b2cddf-5">{loadError}</span>
            <button
              type="button"
              onClick={() => void loadStudents()}
              className="min-h-[44px] w-full rounded-[var(--radius)] border border-border px-4 py-2 font-medium text-foreground sm:w-auto"
             data-nexen-id="nx-06b2cddf-6">
              Try again
            </button>
          </div>
        ) : !hasStudents ? (
          <div className="flex w-full min-w-0 flex-col items-start gap-3 py-2 text-sm text-muted-foreground">
            <p className="break-words" data-nexen-id="nx-06b2cddf-7">
              Invoices need students first. Add a student, then come back to raise this
              month&apos;s invoices.
            </p>
            <Link
              href="/students/new"
              className="inline-flex min-h-[44px] items-center rounded-[var(--radius)] bg-primary px-4 py-2 font-medium text-primary-foreground"
             data-nexen-id="nx-06b2cddf-8">
              Add a student
            </Link>
          </div>
        ) : (
          <StudentCheckList
            students={checklistStudents}
            selectedIds={selectedIds}
            onChange={setSelectedIds}
          />
        )}
      </section>

      <section className="flex w-full min-w-0 flex-col gap-1 rounded-[var(--radius)] border bg-card p-4 shadow-sm sm:p-6" data-nexen-id="nx-06b2cddf-9">
        <h2 className="text-base font-semibold text-foreground" data-nexen-id="nx-06b2cddf-10">Summary</h2>
        <p className="break-words text-sm text-muted-foreground" data-nexen-id="nx-06b2cddf-11">
          {selectedStudents.length === 1
            ? '1 invoice will be created'
            : `${selectedStudents.length} invoices will be created`}
        </p>
        <p className="text-2xl font-semibold text-foreground" data-nexen-id="nx-06b2cddf-12">{formatMoney(totalAmount)}</p>
      </section>

      {formError ? (
        <div
          role="alert"
          className="w-full min-w-0 break-words rounded-[var(--radius)] border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {formError}
        </div>
      ) : null}

      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="min-h-[44px] w-full rounded-[var(--radius)] border border-border px-5 py-2 font-medium text-foreground disabled:opacity-50 sm:w-auto"
         data-nexen-id="nx-06b2cddf-13">
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={!hasStudents || isLoading || isSubmitting}
          className="min-h-[44px] w-full rounded-[var(--radius)] bg-primary px-5 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
         data-nexen-id="nx-06b2cddf-14">
          {isSubmitting ? 'Generating…' : 'Generate invoices'}
        </button>
      </div>
    </div>
  );
}