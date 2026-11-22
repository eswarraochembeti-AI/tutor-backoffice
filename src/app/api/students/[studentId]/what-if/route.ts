import { NextResponse } from 'next/server';
import { db, withDbRetry } from '@/lib/db';

export const dynamic = 'force-dynamic';

const DELAY_DAYS = 15;
const HORIZONS = [30, 60, 90] as const;
const DAY_MS = 24 * 60 * 60 * 1000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ProjectedInvoice = {
  studentId: string;
  amount: number;
  due: Date;
};

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function cashInBy(invoices: ProjectedInvoice[], horizonEnd: Date): number {
  return invoices
    .filter((invoice) => invoice.due.getTime() <= horizonEnd.getTime())
    .reduce((sum, invoice) => sum + invoice.amount, 0);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await params;

  if (!UUID_RE.test(studentId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const student = await withDbRetry(() =>
      db.student.findUnique({
        where: { id: studentId },
        select: { name: true },
      })
    );

    if (!student) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const unpaidInvoices = await withDbRetry(() =>
      db.invoice.findMany({
        where: { status: { not: 'paid' } },
        select: { studentId: true, amount: true, dueDate: true },
      })
    );

    const baseline: ProjectedInvoice[] = unpaidInvoices.map((invoice) => ({
      studentId: invoice.studentId,
      amount: invoice.amount.toNumber(),
      due: new Date(invoice.dueDate),
    }));

    // Simulation only: shifted dates are held in memory and never written back.
    const scenario: ProjectedInvoice[] = baseline.map((invoice) =>
      invoice.studentId === studentId
        ? { ...invoice, due: addDays(invoice.due, DELAY_DAYS) }
        : invoice
    );

    const shiftedAmount = baseline
      .filter((invoice) => invoice.studentId === studentId)
      .reduce((sum, invoice) => sum + invoice.amount, 0);

    const today = startOfTodayUtc();
    const changes: Record<string, number> = {};

    for (const horizon of HORIZONS) {
      const horizonEnd = addDays(today, horizon);
      const baselineCashIn = cashInBy(baseline, horizonEnd);
      const scenarioCashIn = cashInBy(scenario, horizonEnd);
      changes[`cash_in_change_${horizon}`] = round2(scenarioCashIn - baselineCashIn);
    }

    return NextResponse.json({
      whatIf: {
        student_name: student.name,
        delay_days: DELAY_DAYS,
        shifted_amount: round2(shiftedAmount),
        cash_in_change_30: changes.cash_in_change_30,
        cash_in_change_60: changes.cash_in_change_60,
        cash_in_change_90: changes.cash_in_change_90,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}