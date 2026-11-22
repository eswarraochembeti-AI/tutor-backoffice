import { NextResponse } from 'next/server';
import { db, withDbRetry } from '@/lib/db';

export const dynamic = 'force-dynamic';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export async function GET() {
  try {
    const now = new Date();
    const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const today = new Date(todayUtc);

    const invoices = await withDbRetry(() =>
      db.invoice.findMany({
        where: {
          status: 'issued',
          dueDate: { lt: today },
        },
        include: {
          student: { select: { name: true } },
        },
        orderBy: { dueDate: 'asc' },
      })
    );

    const overdueInvoices = invoices.map((invoice) => {
      const dueUtc = Date.UTC(
        invoice.dueDate.getUTCFullYear(),
        invoice.dueDate.getUTCMonth(),
        invoice.dueDate.getUTCDate(),
      );

      return {
        invoice_id: invoice.id,
        student_name: invoice.student.name,
        amount_owed: Number(invoice.amount),
        due_date: invoice.dueDate.toISOString().slice(0, 10),
        days_overdue: Math.floor((todayUtc - dueUtc) / MS_PER_DAY),
      };
    });

    return NextResponse.json({ overdueInvoices });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}