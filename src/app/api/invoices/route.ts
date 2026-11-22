import { NextResponse } from 'next/server';
import { db, withDbRetry } from '@/lib/db';

export const dynamic = 'force-dynamic';

function toDateOnly(value: Date | null): string | null {
  return value ? value.toISOString().slice(0, 10) : null;
}

function toIso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export async function GET() {
  try {
    const rows = await withDbRetry(() =>
      db.invoice.findMany({
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
        include: {
          student: { select: { id: true, name: true } },
        },
      })
    );

    const invoices = rows.map((invoice) => ({
      id: invoice.id,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
      studentId: invoice.studentId,
      studentName: invoice.student.name,
      billingMonth: toDateOnly(invoice.billingMonth),
      amount: Number(invoice.amount),
      status: invoice.status,
      dueDate: toDateOnly(invoice.dueDate),
      paidAt: toIso(invoice.paidAt),
      paidAmount: invoice.paidAmount === null ? null : Number(invoice.paidAmount),
      issuedDate: toIso(invoice.issuedDate),
    }));

    return NextResponse.json({ invoices });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}