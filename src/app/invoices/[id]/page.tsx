'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  createInvoiceAlert,
  deleteInvoice,
  getInvoiceById,
  updateInvoice,
} from '@/lib/api';
import InvoiceStatusBadge from '@/components/InvoiceStatusBadge';
import MarkPaidForm from '@/components/MarkPaidForm';
import PageHeader from '@/components/PageHeader';

type InvoiceDetail = Awaited<ReturnType<typeof getInvoiceById>>;

function formatMoney(value: number | string | null | undefined): string {
  const amount = Number(value ?? 0);
  return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}

function formatDate(value: string | number | Date | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatMonth(value: string | number | Date | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function toDateInput(value: string | number | Date | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

const inputClass =
  'min-h-11 w-full min-w-0 rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-foreground';
const buttonClass =
  'inline-flex min-h-11 items-center justify-center rounded-[var(--radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50';
const secondaryButtonClass =
  'inline-flex min-h-11 items-center justify-center rounded-[var(--radius)] border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground disabled:opacity-50';
const cardClass =
  'min-w-0 rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm sm:p-6';

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const invoiceId = params.id;
  const router = useRouter();

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showMarkPaid, setShowMarkPaid] = useState(false);
  const [isChasing, setIsChasing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [issuedInput, setIssuedInput] = useState('');
  const [dueInput, setDueInput] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    if (!invoiceId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getInvoiceById(invoiceId);
      setInvoice(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load this invoice.');
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!invoice) return;
    setAmountInput(String(invoice.amount));
    setIssuedInput(toDateInput(invoice.issuedDate));
    setDueInput(toDateInput(invoice.dueDate));
  }, [invoice]);

  const handleChase = async () => {
    setActionError(null);
    setNotice(null);
    setIsChasing(true);
    try {
      await createInvoiceAlert(invoiceId, {});
      setNotice('Invoice set to chase today.');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not set the chase alert.');
    } finally {
      setIsChasing(false);
    }
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEditError(null);
    setNotice(null);
    const amount = Number(amountInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      setEditError('Enter an amount greater than zero.');
      return;
    }
    if (!dueInput) {
      setEditError('Choose a due date.');
      return;
    }
    setIsSaving(true);
    try {
      await updateInvoice(invoiceId, {
        amount,
        issuedDate: issuedInput || undefined,
        dueDate: dueInput,
      });
      await load();
      setNotice('Invoice updated.');
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Could not save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setActionError(null);
    setIsDeleting(true);
    try {
      await deleteInvoice(invoiceId);
      router.push('/invoices');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not delete this invoice.');
      setIsDeleting(false);
    }
  };

  const isPaid = invoice?.status === 'paid';
  const daysOverdue = invoice?.days_overdue ?? 0;
  const isOverdue = !isPaid && daysOverdue > 0;

  return (
    <main data-nexen-component="nx_app_invoices__id__page" className="mx-auto w-full max-w-3xl min-w-0 space-y-6 p-4 sm:p-6" data-nexen-id="nx-4eca7f76-0">
      <Link
        href="/invoices"
        className="inline-flex min-h-11 items-center text-sm text-muted-foreground underline-offset-4 hover:underline"
       data-nexen-id="nx-4eca7f76-1">
        ← Back to invoices
      </Link>

      <PageHeader
        title={invoice ? invoice.student_name : 'Invoice'}
        subtitle={invoice ? `Invoice for ${formatMonth(invoice.billingMonth)}` : 'Loading invoice…'}
        actions={null}
        className=""
      />

      {loadError && (
        <p role="alert" className="rounded-[var(--radius)] border border-border bg-card p-4 text-sm text-destructive" data-nexen-id="nx-4eca7f76-2">
          {loadError}
        </p>
      )}

      {isLoading && !invoice && !loadError && (
        <p className="text-sm text-muted-foreground" data-nexen-id="nx-4eca7f76-3">Loading invoice…</p>
      )}

      {invoice && (
        <>
          <section className={cardClass} data-nexen-id="nx-4eca7f76-4">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-3xl font-semibold break-words" data-nexen-id="nx-4eca7f76-5">{formatMoney(invoice.amount)}</p>
              <InvoiceStatusBadge status={invoice.status} className="" />
            </div>

            {isOverdue && (
              <p className="mt-3 text-sm font-medium text-destructive" data-nexen-id="nx-4eca7f76-6">
                {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue
              </p>
            )}

            <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2" data-nexen-id="nx-4eca7f76-7">
              <div className="min-w-0">
                <dt className="text-muted-foreground" data-nexen-id="nx-4eca7f76-8">Student</dt>
                <dd className="mt-1 min-w-0 break-words" data-nexen-id="nx-4eca7f76-9">
                  <Link
                    href={`/students/${invoice.studentId}`}
                    className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
                   data-nexen-id="nx-4eca7f76-10">
                    {invoice.student_name}
                  </Link>
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-muted-foreground" data-nexen-id="nx-4eca7f76-11">Due date</dt>
                <dd className="mt-1" data-nexen-id="nx-4eca7f76-12">{formatDate(invoice.dueDate)}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-muted-foreground" data-nexen-id="nx-4eca7f76-13">Issued date</dt>
                <dd className="mt-1" data-nexen-id="nx-4eca7f76-14">{formatDate(invoice.issuedDate)}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-muted-foreground" data-nexen-id="nx-4eca7f76-15">Status</dt>
                <dd className="mt-1" data-nexen-id="nx-4eca7f76-16">{isPaid ? 'Paid' : 'Unpaid'}</dd>
              </div>
              {isPaid && (
                <>
                  <div className="min-w-0">
                    <dt className="text-muted-foreground" data-nexen-id="nx-4eca7f76-17">Paid on</dt>
                    <dd className="mt-1" data-nexen-id="nx-4eca7f76-18">{formatDate(invoice.paidAt)}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-muted-foreground" data-nexen-id="nx-4eca7f76-19">Amount received</dt>
                    <dd className="mt-1" data-nexen-id="nx-4eca7f76-20">{formatMoney(invoice.paidAmount)}</dd>
                  </div>
                </>
              )}
            </dl>
          </section>

          {notice && (
            <p role="status" className="rounded-[var(--radius)] border border-border bg-card p-4 text-sm" data-nexen-id="nx-4eca7f76-21">
              {notice}
            </p>
          )}

          {actionError && (
            <p role="alert" className="rounded-[var(--radius)] border border-border bg-card p-4 text-sm text-destructive" data-nexen-id="nx-4eca7f76-22">
              {actionError}
            </p>
          )}

          {!isPaid && (
            <section className={`${cardClass} space-y-4`} data-nexen-id="nx-4eca7f76-23">
              <h2 className="text-lg font-semibold" data-nexen-id="nx-4eca7f76-24">Chase payment</h2>
              <button type="button" onClick={handleChase} disabled={isChasing} className={secondaryButtonClass} data-nexen-id="nx-4eca7f76-25">
                {isChasing ? 'Setting alert…' : 'Chase today'}
              </button>
            </section>
          )}

          {!isPaid && (
            <section className={`${cardClass} space-y-4`} data-nexen-id="nx-4eca7f76-26">
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold" data-nexen-id="nx-4eca7f76-27">Mark as paid</h2>
                {!showMarkPaid && (
                  <button type="button" onClick={() => setShowMarkPaid(true)} className={buttonClass} data-nexen-id="nx-4eca7f76-28">
                    Mark as paid
                  </button>
                )}
              </div>
              {showMarkPaid && (
                <MarkPaidForm
                  invoiceId={invoiceId}
                  defaultAmount={invoice.amount}
                  onPaid={() => {
                    setShowMarkPaid(false);
                    setNotice('Invoice marked as paid.');
                    void load();
                  }}
                  onCancel={() => setShowMarkPaid(false)}
                />
              )}
            </section>
          )}

          {!isPaid && (
            <section className={cardClass} data-nexen-id="nx-4eca7f76-29">
              <h2 className="mb-4 text-lg font-semibold" data-nexen-id="nx-4eca7f76-30">Edit invoice</h2>
              <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 sm:grid-cols-3" data-nexen-id="nx-4eca7f76-31">
                <label className="flex min-w-0 flex-col gap-1 text-sm" data-nexen-id="nx-4eca7f76-32">
                  <span className="text-muted-foreground" data-nexen-id="nx-4eca7f76-33">Amount</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={amountInput}
                    onChange={(event) => setAmountInput(event.target.value)}
                    className={inputClass}
                   data-nexen-id="nx-4eca7f76-34"/>
                </label>
                <label className="flex min-w-0 flex-col gap-1 text-sm" data-nexen-id="nx-4eca7f76-35">
                  <span className="text-muted-foreground" data-nexen-id="nx-4eca7f76-36">Issued date</span>
                  <input
                    type="date"
                    value={issuedInput}
                    onChange={(event) => setIssuedInput(event.target.value)}
                    className={inputClass}
                   data-nexen-id="nx-4eca7f76-37"/>
                </label>
                <label className="flex min-w-0 flex-col gap-1 text-sm" data-nexen-id="nx-4eca7f76-38">
                  <span className="text-muted-foreground" data-nexen-id="nx-4eca7f76-39">Due date</span>
                  <input
                    type="date"
                    value={dueInput}
                    onChange={(event) => setDueInput(event.target.value)}
                    className={inputClass}
                   data-nexen-id="nx-4eca7f76-40"/>
                </label>
                {editError && (
                  <p role="alert" className="text-sm text-destructive sm:col-span-3" data-nexen-id="nx-4eca7f76-41">
                    {editError}
                  </p>
                )}
                <div className="sm:col-span-3">
                  <button type="submit" disabled={isSaving} className={buttonClass} data-nexen-id="nx-4eca7f76-42">
                    {isSaving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </form>
            </section>
          )}

          {!isPaid && (
            <section className={`${cardClass} space-y-4`} data-nexen-id="nx-4eca7f76-43">
              <h2 className="text-lg font-semibold" data-nexen-id="nx-4eca7f76-44">Delete invoice</h2>
              {!confirmingDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className={secondaryButtonClass}
                 data-nexen-id="nx-4eca7f76-45">
                  Delete invoice
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground" data-nexen-id="nx-4eca7f76-46">
                    Delete this invoice raised by mistake? This also removes its chase alerts.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className={buttonClass}
                     data-nexen-id="nx-4eca7f76-47">
                      {isDeleting ? 'Deleting…' : 'Confirm delete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(false)}
                      disabled={isDeleting}
                      className={secondaryButtonClass}
                     data-nexen-id="nx-4eca7f76-48">
                      Keep invoice
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </main>
  );
}