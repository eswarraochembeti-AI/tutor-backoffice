import { NextResponse } from 'next/server';
import { db, withDbRetry } from '@/lib/db';

export const dynamic = 'force-dynamic';

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const n = Number(String(value));
  return Number.isFinite(n) ? n : 0;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function sumDueWithin(rows: { amount: unknown; dueDate: Date }[], endMs: number): number {
  return rows
    .filter((row) => row.dueDate.getTime() <= endMs)
    .reduce((total, row) => total + toNumber(row.amount), 0);
}

export async function GET() {
  try {
    const today = startOfTodayUtc();
    const todayMs = today.getTime();
    const horizonEnd = new Date(todayMs + 90 * DAY_MS);

    // Unpaid invoices (status "issued") due on or before the 90-day horizon.
    // Overdue invoices (dueDate in the past) are included automatically, so they
    // count in every horizon, as required.
    // Unpaid bills due on or before the 90-day horizon. Bills due beyond 90 days
    // are excluded by this filter.
    const [invoices, bills] = await Promise.all([
      withDbRetry(() =>
        db.invoice.findMany({
          where: {
            status: 'issued',
            dueDate: { lte: horizonEnd },
          },
          select: { amount: true, dueDate: true },
        })
      ),
      withDbRetry(() =>
        db.bill.findMany({
          where: {
            status: 'unpaid',
            dueDate: { lte: horizonEnd },
          },
          select: { amount: true, dueDate: true },
        })
      ),
    ]);

    const buildHorizon = (days: number) => {
      const endMs = todayMs + days * DAY_MS;
      const cashIn = round2(sumDueWithin(invoices, endMs));
      const cashOut = round2(sumDueWithin(bills, endMs));
      return {
        cash_in: cashIn,
        cash_out: cashOut,
        net: round2(cashIn - cashOut),
      };
    };

    const forecast = {
      days_30: buildHorizon(30),
      days_60: buildHorizon(60),
      days_90: buildHorizon(90),
    };

    return NextResponse.json(
      { forecast },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}