import { NextRequest, NextResponse } from 'next/server';
import { db, withDbRetry } from '@/lib/db';

const SHIFT_DAYS = 15;
const DAY_MS = 24 * 60 * 60 * 1000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await params;

  if (!UUID_RE.test(studentId)) {
    return NextResponse.json({ error: 'Invalid student id' }, { status: 400 });
  }

  try {
    const student = await withDbRetry(() =>
      db.student.findUnique({
        where: { id: studentId },
        select: { id: true },
      })
    );

    if (!student) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Unpaid and overdue invoices are both stored as "issued";
    // overdue is derived from dueDate, so every non-paid invoice is included.
    const rows = await withDbRetry(() =>
      db.invoice.findMany({
        where: { studentId, status: 'issued' },
        orderBy: { dueDate: 'asc' },
      })
    );

    const invoices = rows.map((inv) => ({
      id: inv.id,
      studentId: inv.studentId,
      billingMonth: inv.billingMonth.toISOString(),
      amount: Number(inv.amount),
      status: inv.status,
      dueDate: inv.dueDate.toISOString(),
      shiftedDueDate: new Date(inv.dueDate.getTime() + SHIFT_DAYS * DAY_MS).toISOString(),
      paidAt: inv.paidAt ? inv.paidAt.toISOString() : null,
      paidAmount: inv.paidAmount !== null ? Number(inv.paidAmount) : null,
      issuedDate: inv.issuedDate ? inv.issuedDate.toISOString() : null,
    }));

    return NextResponse.json({ invoices });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}