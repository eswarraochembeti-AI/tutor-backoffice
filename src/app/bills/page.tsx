'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import BillRow from '@/components/BillRow';
import PageHeader from '@/components/PageHeader';
import { getBills } from '@/lib/api';
import type { Bill } from '@/types/bill';

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getBills();
      setBills(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load bills.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const safeBills = Array.isArray(bills) ? bills : [];
  const sorted = [...safeBills].sort((a, b) =>
    String(a.dueDate).localeCompare(String(b.dueDate)),
  );

  return (
    <div data-nexen-component="nx_app_bills_page" className="mx-auto w-full max-w-3xl min-w-0 space-y-6 px-4 py-6">
      <PageHeader
        title="Bills"
        subtitle="Money you pay out, with due dates and paid status."
        actions={
          <Link
            href="/bills/new"
            className="inline-flex min-h-[44px] items-center rounded-[var(--radius)] bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm"
           data-nexen-id="nx-34067a5e-0">
            Add bill
          </Link>
        }
        className=""
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground" data-nexen-id="nx-34067a5e-1">Loading bills…</p>
      ) : error ? (
        <div className="rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm">
          <p className="text-sm text-destructive" data-nexen-id="nx-34067a5e-2">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-3 min-h-[44px] rounded-[var(--radius)] border border-border px-4 text-sm font-medium"
           data-nexen-id="nx-34067a5e-3">
            Try again
          </button>
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-border bg-card p-6 text-center shadow-sm">
          <p className="font-medium" data-nexen-id="nx-34067a5e-4">No bills yet.</p>
          <p className="mt-1 text-sm text-muted-foreground" data-nexen-id="nx-34067a5e-5">
            Add a bill so it counts as cash out in the forecast.
          </p>
        </div>
      ) : (
        <ul className="space-y-3" data-nexen-id="nx-34067a5e-6">
          {sorted.map((bill) => (
            <li key={bill.id} className="min-w-0" data-nexen-id="nx-34067a5e-7">
              <BillRow bill={bill} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}