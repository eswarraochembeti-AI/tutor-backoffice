'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import BillForm, { type BillFormValues } from '@/components/BillForm';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import PageHeader from '@/components/PageHeader';
import {
  ApiError,
  createBillMarkPaid,
  createBillMarkUnpaid,
  deleteBill,
  getBillById,
  updateBill,
} from '@/lib/api';
import type { Bill } from '@/types/bill';

type FormInput = { title: string; amount: string; dueDate: string; details: string };

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

function validateBillForm(values: FormInput): string | null {
  if (!values.title.trim()) return 'Enter a bill title.';
  const amount = values.amount.trim();
  if (!amount) return 'Enter the bill amount.';
  if (!/^\d+(\.\d+)?$/.test(amount)) return 'Enter the bill amount.';
  if (Number(amount) <= 0) return 'Bill amount must be more than 0.';
  if (!/^\d+(\.\d{1,2})?$/.test(amount)) return 'Enter an amount with no more than two decimal places.';
  if (!values.dueDate) return 'Choose a due date for this bill.';
  if (Number.isNaN(Date.parse(values.dueDate))) return 'Enter a valid due date.';
  if (values.details.length > 500) return 'Bill details must be 500 characters or fewer.';
  return null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function BillDetailPage({ params }: { params: { id: string } }) {
  const billId = params.id;
  const router = useRouter();
  const [bill, setBill] = useState<Bill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadBill = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      setBill(await getBillById(billId));
    } catch (err) {
      setLoadError(errorMessage(err, 'Could not load this bill.'));
    } finally {
      setIsLoading(false);
    }
  }, [billId]);

  useEffect(() => {
    void loadBill();
  }, [loadBill]);

  async function handleSave(values: BillFormValues) {
    const problem = validateBillForm({ ...values, amount: String(values.amount) });
    if (problem) {
      setSaveError(problem);
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      const updated = await updateBill(billId, {
        title: values.title.trim(),
        amount: Number(values.amount),
        dueDate: values.dueDate,
        details: values.details.trim() || null,
      });
      setBill(updated);
      setEditing(false);
    } catch (err) {
      setSaveError(errorMessage(err, 'Could not save changes.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleMarkPaid() {
    setIsActing(true);
    setActionError(null);
    try {
      setBill(await createBillMarkPaid(billId, {}));
    } catch (err) {
      setActionError(errorMessage(err, 'Could not mark this bill as paid.'));
    } finally {
      setIsActing(false);
    }
  }

  async function handleMarkUnpaid() {
    setIsActing(true);
    setActionError(null);
    try {
      setBill(await createBillMarkUnpaid(billId, {}));
    } catch (err) {
      setActionError(errorMessage(err, 'Could not mark this bill as unpaid.'));
    } finally {
      setIsActing(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteBill(billId);
      router.push('/bills');
    } catch (err) {
      setDeleteError(errorMessage(err, 'Could not delete this bill.'));
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return <p className="p-6 text-sm text-muted-foreground" data-nexen-id="nx-719d0d65-0">Loading bill…</p>;
  }

  if (loadError || !bill) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 sm:p-6">
        <Link href="/bills" className="text-sm text-muted-foreground hover:underline" data-nexen-id="nx-719d0d65-1">← Back to bills</Link>
        <p className="text-sm text-destructive" data-nexen-id="nx-719d0d65-2">{loadError ?? 'Bill not found.'}</p>
        <button
          type="button"
          onClick={() => void loadBill()}
          className="min-h-11 w-full rounded-[var(--radius)] border px-4 py-2 sm:w-auto"
         data-nexen-id="nx-719d0d65-3">
          Try again
        </button>
      </div>
    );
  }

  const isPaid = bill.status === 'paid';
  const amountText = `₹${Number(bill.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div data-nexen-component="nx_app_bills__id__page" className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 sm:p-6">
      <Link href="/bills" className="text-sm text-muted-foreground hover:underline" data-nexen-id="nx-719d0d65-4">← Back to bills</Link>

      <PageHeader
        title={bill.title || 'Untitled bill'}
        subtitle={`Due ${formatDate(bill.dueDate)}`}
        actions={null}
        className=""
      />

      <section className="flex flex-col gap-6 rounded-[var(--radius)] border bg-card p-6 shadow-sm" data-nexen-id="nx-719d0d65-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground" data-nexen-id="nx-719d0d65-6">Amount</p>
            <p className="text-3xl font-bold" data-nexen-id="nx-719d0d65-7">{amountText}</p>
          </div>
          <span
            className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${
              isPaid ? 'bg-primary/15 text-primary' : 'bg-destructive/15 text-destructive'
            }`}
           data-nexen-id="nx-719d0d65-8">
            {isPaid ? 'Paid' : 'Unpaid'}
          </span>
        </div>

        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2" data-nexen-id="nx-719d0d65-9">
          <div className="min-w-0">
            <dt className="text-muted-foreground" data-nexen-id="nx-719d0d65-10">Title</dt>
            <dd className="break-words" data-nexen-id="nx-719d0d65-11">{bill.title || '—'}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-muted-foreground" data-nexen-id="nx-719d0d65-12">Due date</dt>
            <dd data-nexen-id="nx-719d0d65-13">{formatDate(bill.dueDate)}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-muted-foreground" data-nexen-id="nx-719d0d65-14">Paid on</dt>
            <dd data-nexen-id="nx-719d0d65-15">{bill.paidAt ? formatDate(bill.paidAt) : '—'}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-muted-foreground" data-nexen-id="nx-719d0d65-16">Details</dt>
            <dd className="break-words whitespace-pre-line" data-nexen-id="nx-719d0d65-17">{bill.details || '—'}</dd>
          </div>
        </dl>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {isPaid ? (
            <button
              type="button"
              onClick={() => void handleMarkUnpaid()}
              disabled={isActing}
              className="min-h-11 rounded-[var(--radius)] border px-4 py-2 font-medium disabled:opacity-50"
             data-nexen-id="nx-719d0d65-18">
              Mark as unpaid
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleMarkPaid()}
              disabled={isActing}
              className="min-h-11 rounded-[var(--radius)] bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50"
             data-nexen-id="nx-719d0d65-19">
              Mark as paid
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setEditing((open) => !open);
              setSaveError(null);
            }}
            className="min-h-11 rounded-[var(--radius)] border px-4 py-2 font-medium"
           data-nexen-id="nx-719d0d65-20">
            {editing ? 'Close editor' : 'Edit bill'}
          </button>
          <button
            type="button"
            onClick={() => {
              setDeleteError(null);
              setConfirmOpen(true);
            }}
            className="min-h-11 rounded-[var(--radius)] border border-destructive/40 px-4 py-2 font-medium text-destructive"
           data-nexen-id="nx-719d0d65-21">
            Delete bill
          </button>
        </div>
        {actionError && <p className="text-sm text-destructive" data-nexen-id="nx-719d0d65-22">{actionError}</p>}
      </section>

      {editing && (
        <section className="rounded-[var(--radius)] border bg-card p-6 shadow-sm" data-nexen-id="nx-719d0d65-23">
          <h2 className="mb-4 text-lg font-semibold" data-nexen-id="nx-719d0d65-24">Edit bill</h2>
          <BillForm
            initialValues={{
              title: bill.title ?? '',
              amount: Number(bill.amount),
              dueDate: bill.dueDate.slice(0, 10),
              details: bill.details ?? '',
            }}
            submitLabel="Save changes"
            isSubmitting={isSaving}
            serverError={saveError}
            onSubmit={handleSave}
            onCancel={() => {
              setEditing(false);
              setSaveError(null);
            }}
          />
        </section>
      )}

      <ConfirmDeleteDialog
        open={confirmOpen}
        title="Delete this bill?"
        message="Only delete bills entered by mistake. The bill will no longer count in the cash flow forecast."
        confirmLabel="Delete bill"
        cancelLabel="Keep bill"
        isDeleting={isDeleting}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}