import { NextResponse } from 'next/server';
import { db, withDbRetry } from '@/lib/db';

export const dynamic = 'force-dynamic';

const MS_PER_DAY = 86_400_000;

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function GET() {
  try {
    const today = startOfTodayUtc();
    const todayIso = today.toISOString().slice(0, 10);

    // Chase alerts: invoices still unpaid (status "issued", no paidAt)
    // whose due date is today or earlier. Paid invoices never appear.
    const invoices = await withDbRetry(() =>
      db.invoice.findMany({
        where: {
          status: 'issued',
          paidAt: null,
          dueDate: { lte: today },
        },
        include: {
          student: { select: { name: true } },
        },
        orderBy: { dueDate: 'asc' },
      })
    );

    const alerts = invoices
      .map((invoice) => {
        const daysOverdue = Math.max(
          0,
          Math.floor((today.getTime() - invoice.dueDate.getTime()) / MS_PER_DAY),
        );
        return {
          alert_id: invoice.id,
          invoice_id: invoice.id,
          billing_month: invoice.billingMonth.toISOString().slice(0, 10),
          student_name: invoice.student.name,
          amount_owed: Number(invoice.amount),
          days_overdue: daysOverdue,
          alert_date: todayIso,
          status: 'active',
        };
      })
      // Most overdue first.
      .sort((a, b) => b.days_overdue - a.days_overdue);

    return NextResponse.json({ alerts });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}