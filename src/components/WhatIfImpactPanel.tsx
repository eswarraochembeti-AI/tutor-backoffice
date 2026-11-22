'use client';

import { useEffect, useMemo, useState } from 'react';
import { getStudentInvoices } from '@/lib/api';
import type { Invoice } from '@/types/invoice';

const HORIZONS = [30, 60, 90] as const;
const DELAY_DAYS = 15;
const MISSING_STUDENT_MESSAGE = 'Please choose a student to run the what-if analysis.';

interface WhatIfImpactPanelProps {
  studentId?: string | null;
  studentName?: string;
}

interface OpenInvoice {
  id: string;
  billingMonth: string;
  amount: number;
  due: Date;
  shifted: Date;
  overdue: boolean;
}

interface ShiftedRow extends OpenInvoice {
  outside: boolean;
}

interface HorizonImpact {
  h: number;
  before: number;
  after: number;
  delta: number;
}

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
const wholeRupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function billingMonthLabel(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Invoice';
  return `${d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })} invoice`;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDay(value: string | Date): Date {
  const d =
    typeof value === 'string'
      ? new Date(`${value.slice(0, 10)}T00:00:00`)
      : new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

function buildForecast(invoices: Invoice[], today: Date) {
  const open: OpenInvoice[] = invoices
    .filter((inv) => String(inv.status) !== 'paid')
    .map((inv) => {
      const due = toDay(inv.dueDate);
      return {
        id: inv.id,
        billingMonth: inv.billingMonth,
        amount: Number(inv.amount),
        due,
        shifted: addDays(due, DELAY_DAYS),
        overdue: due < today,
      };
    });

  // Overdue invoices are counted in every horizon (receipt date floors at today).
  const cashIn = (dateOf: (r: OpenInvoice) => Date, horizon: number) =>
    open.reduce((sum, r) => {
      const date = dateOf(r);
      const effective = date < today ? today : date;
      return daysBetween(today, effective) <= horizon ? sum + r.amount : sum;
    }, 0);

  const horizons: HorizonImpact[] = HORIZONS.map((h) => {
    const before = cashIn((r) => r.due, h);
    const after = cashIn((r) => r.shifted, h);
    return { h, before, after, delta: after - before };
  });

  const rows: ShiftedRow[] = open
    .map((r) => ({ ...r, outside: daysBetween(today, r.shifted) > 90 }))
    .sort((a, b) => a.shifted.getTime() - b.shifted.getTime());

  return { horizons, rows };
}

export default function WhatIfImpactPanel(props: WhatIfImpactPanelProps) {
  const { studentId, studentName } = props;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [today, setToday] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) {
      setInvoices([]);
      setError(null);
      return;
    }
    let cancelled = false;
    setToday(startOfToday());
    setIsLoading(true);
    setError(null);
    getStudentInvoices(studentId)
      .then((data) => {
        if (!cancelled) setInvoices(Array.isArray(data) ? data : []);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load invoices.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const safeInvoices = Array.isArray(invoices) ? invoices : [];
  const forecast = useMemo(
    () => (today ? buildForecast(safeInvoices, today) : null),
    [safeInvoices, today]
  );

  if (!studentId) {
    return (
      <section className="w-full min-w-0 rounded-[var(--radius)] border bg-card p-4 shadow-sm sm:p-6" data-nexen-id="nx-9d93f795-0">
        <p className="text-sm text-destructive" data-nexen-id="nx-9d93f795-1">{MISSING_STUDENT_MESSAGE}</p>
      </section>
    );
  }

  return (
    <section data-nexen-component="nx_components_WhatIfImpactPanel" className="w-full min-w-0 space-y-4 rounded-[var(--radius)] border bg-card p-4 shadow-sm sm:p-6" data-nexen-id="nx-9d93f795-2">
      <header className="min-w-0" data-nexen-id="nx-9d93f795-3">
        <h3 className="text-base font-semibold text-foreground" data-nexen-id="nx-9d93f795-4">
          What if {studentName ?? 'this student'} pays {DELAY_DAYS} days late?
        </h3>
        <p className="text-sm text-muted-foreground" data-nexen-id="nx-9d93f795-5">
          Simulation only. Stored invoices are not changed.
        </p>
      </header>

      {error && <p className="text-sm text-destructive" data-nexen-id="nx-9d93f795-6">{error}</p>}
      {isLoading && <p className="text-sm text-muted-foreground" data-nexen-id="nx-9d93f795-7">Calculating impact…</p>}

      {!isLoading && !error && forecast && forecast.rows.length === 0 && (
        <p className="text-sm text-muted-foreground" data-nexen-id="nx-9d93f795-8">No unpaid invoices for this student.</p>
      )}

      {!isLoading && !error && forecast && forecast.rows.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {forecast.horizons.map((impact) => (
              <div
                key={impact.h}
                className="min-w-0 rounded-[var(--radius)] border bg-background p-3"
              >
                <p className="text-xs text-muted-foreground" data-nexen-id="nx-9d93f795-9">{impact.h}-day cash in</p>
                <p className="text-lg font-semibold text-foreground" data-nexen-id="nx-9d93f795-10">
                  {currency.format(impact.after)}
                </p>
                <p
                  className={`text-xs font-medium ${
                    impact.delta < 0 ? 'text-destructive' : 'text-primary'
                  }`}
                 data-nexen-id="nx-9d93f795-11">
                  {Math.round(impact.delta) === 0
                    ? 'The invoices of this student remain in the same windows and thus the forecast remains unchanged'
                    : impact.delta < 0
                      ? `${wholeRupees.format(Math.abs(impact.delta))} shifts out of the next ${impact.h} days`
                      : `${wholeRupees.format(Math.abs(impact.delta))} shifts into the next ${impact.h} days`}
                </p>
              </div>
            ))}
          </div>

          <div className="w-full overflow-x-auto rounded-[var(--radius)] border">
            <table className="w-full min-w-[480px] text-sm" data-nexen-id="nx-9d93f795-12">
              <thead data-nexen-id="nx-9d93f795-13">
                <tr className="text-left text-muted-foreground" data-nexen-id="nx-9d93f795-14">
                  <th className="px-3 py-2 font-medium" data-nexen-id="nx-9d93f795-15">Invoice</th>
                  <th className="px-3 py-2 font-medium" data-nexen-id="nx-9d93f795-16">Amount</th>
                  <th className="px-3 py-2 font-medium" data-nexen-id="nx-9d93f795-17">Current due</th>
                  <th className="px-3 py-2 font-medium" data-nexen-id="nx-9d93f795-18">Shifted to</th>
                  <th className="px-3 py-2 font-medium" data-nexen-id="nx-9d93f795-19">Status</th>
                </tr>
              </thead>
              <tbody data-nexen-id="nx-9d93f795-20">
                {forecast.rows.map((row) => (
                  <tr key={row.id} className="border-t" data-nexen-id="nx-9d93f795-21">
                    <td className="px-3 py-2 text-xs text-muted-foreground" data-nexen-id="nx-9d93f795-22">
                      {billingMonthLabel(row.billingMonth)}
                    </td>
                    <td className="px-3 py-2" data-nexen-id="nx-9d93f795-23">{currency.format(row.amount)}</td>
                    <td className="px-3 py-2" data-nexen-id="nx-9d93f795-24">{row.due.toLocaleDateString('en-IN')}</td>
                    <td className="px-3 py-2" data-nexen-id="nx-9d93f795-25">{row.shifted.toLocaleDateString('en-IN')}</td>
                    <td className="px-3 py-2" data-nexen-id="nx-9d93f795-26">
                      {row.outside ? (
                        <span className="text-muted-foreground" data-nexen-id="nx-9d93f795-27">Outside 90 days</span>
                      ) : row.overdue ? (
                        <span className="text-destructive" data-nexen-id="nx-9d93f795-28">Overdue</span>
                      ) : (
                        <span className="text-foreground" data-nexen-id="nx-9d93f795-29">Open</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}