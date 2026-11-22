'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import InvoiceTable from '@/components/InvoiceTable';
import PageHeader from '@/components/PageHeader';
import { getInvoices } from '@/lib/api';
import type { Invoice } from '@/types/invoice';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getInvoices();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load invoices.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main data-nexen-component="nx_app_invoices_page" className="mx-auto w-full max-w-5xl min-w-0 space-y-6 px-4 py-6 sm:px-6" data-nexen-id="nx-a5b56746-0">
      <PageHeader
        title="Invoices"
        subtitle="Every monthly invoice and whether it has been paid."
        actions={
          <Link
            href="/invoices/new"
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm"
           data-nexen-id="nx-a5b56746-1">
            New invoice
          </Link>
        }
        className=""
      />

      {isLoading ? (
        <p role="status" className="text-sm text-muted-foreground" data-nexen-id="nx-a5b56746-2">
          Loading invoices…
        </p>
      ) : error ? (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-[var(--radius)] border border-destructive/30 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="min-w-0 text-sm text-destructive" data-nexen-id="nx-a5b56746-3">
            The invoices could not be loaded. {error}
          </p>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius)] border border-border px-4 py-2 text-sm font-medium text-foreground"
           data-nexen-id="nx-a5b56746-4">
            Try again
          </button>
        </div>
      ) : (
        <div className="min-w-0 overflow-x-auto">
          <InvoiceTable invoices={invoices} />
        </div>
      )}
    </main>
  );
}