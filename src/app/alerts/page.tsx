'use client';

import { useCallback, useEffect, useState } from 'react';
import AlertCard from '@/components/AlertCard';
import PageHeader from '@/components/PageHeader';
import { getAlerts } from '@/lib/api';

type AlertItem = Awaited<ReturnType<typeof getAlerts>>[number] & { billing_month?: string };

function billingLabel(value?: string): string {
  if (!value) return 'Invoice';
  const label = new Date(value).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return `Invoice for ${label}`;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAlerts();
      const list = Array.isArray(data) ? data : [];
      setAlerts([...list].sort((a, b) => b.days_overdue - a.days_overdue));
    } catch {
      setError('Alerts could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main data-nexen-component="nx_app_alerts_page" className="mx-auto w-full max-w-3xl min-w-0 space-y-6 px-4 py-6" data-nexen-id="nx-0eac73b5-0">
      <PageHeader
        title="Alerts"
        subtitle="Invoices to chase today."
        actions={
          <span className="rounded-full bg-card px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm" data-nexen-id="nx-0eac73b5-1">
            {isLoading ? '…' : `${alerts.length} active`}
          </span>
        }
        className=""
      />

      {isLoading && (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-24 w-full animate-pulse rounded-[var(--radius)] border border-border bg-card"
            />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="flex flex-col gap-3 rounded-[var(--radius)] border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-destructive" data-nexen-id="nx-0eac73b5-2">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="min-h-11 rounded-[var(--radius)] border border-border px-4 text-sm font-medium"
           data-nexen-id="nx-0eac73b5-3">
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && alerts.length === 0 && (
        <div className="rounded-[var(--radius)] border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground" data-nexen-id="nx-0eac73b5-4">
            There are no invoices to chase today.
          </p>
        </div>
      )}

      {!isLoading && !error && alerts.length > 0 && (
        <ul className="space-y-3" data-nexen-id="nx-0eac73b5-5">
          {alerts.map((alert) => (
            <li key={alert.alert_id} className="min-w-0" data-nexen-id="nx-0eac73b5-6">
              <AlertCard
                invoiceId={alert.invoice_id}
                message="Chase this invoice today"
                studentName={alert.student_name}
                invoiceRef={billingLabel(alert.billing_month)}
                amountOwed={alert.amount_owed}
                daysOverdue={alert.days_overdue}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}