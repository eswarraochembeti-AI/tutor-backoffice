import { NextResponse } from 'next/server';
import { db, withDbRetry } from '@/lib/db';

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseDay(value: string): Date | null {
  if (!DAY_RE.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  // Reject impossible dates such as 2025-02-31 that Date would otherwise roll over.
  if (date.toISOString().slice(0, 10) !== value) return null;
  return date;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { billing_month, issued_date, due_date } = body as Record<string, unknown>;

  if (typeof billing_month !== 'string' || billing_month.trim() === '') {
    return NextResponse.json({ error: 'Please choose a billing month.' }, { status: 400 });
  }
  const month = billing_month.trim();
  if (!MONTH_RE.test(month)) {
    return NextResponse.json(
      { error: 'Enter a valid billing month (for example, 2025-03).' },
      { status: 400 },
    );
  }

  if (typeof due_date !== 'string' || due_date.trim() === '') {
    return NextResponse.json({ error: 'Please choose a due date.' }, { status: 400 });
  }
  const dueDate = parseDay(due_date.trim());
  if (!dueDate) {
    return NextResponse.json({ error: 'Enter a valid due date (YYYY-MM-DD).' }, { status: 400 });
  }

  let issuedDate: Date | null = null;
  if (issued_date !== undefined && issued_date !== null && issued_date !== '') {
    if (typeof issued_date !== 'string') {
      return NextResponse.json({ error: 'Enter a valid issued date (YYYY-MM-DD).' }, { status: 400 });
    }
    issuedDate = parseDay(issued_date.trim());
    if (!issuedDate) {
      return NextResponse.json({ error: 'Enter a valid issued date (YYYY-MM-DD).' }, { status: 400 });
    }
  }

  const billingMonth = new Date(`${month}-01T00:00:00.000Z`);

  try {
    const result = await withDbRetry(() =>
      db.$transaction(async (tx) => {
        const activeStudents = await tx.student.findMany({
          where: { status: 'active' },
          select: { id: true, monthlyFee: true },
        });

        if (activeStudents.length === 0) {
          return { created: 0, skipped: 0 };
        }

        const existing = await tx.invoice.findMany({
          where: {
            billingMonth,
            studentId: { in: activeStudents.map((s) => s.id) },
          },
          select: { studentId: true },
        });
        const alreadyInvoiced = new Set(existing.map((e) => e.studentId));

        const toCreate = activeStudents.filter((s) => !alreadyInvoiced.has(s.id));

        if (toCreate.length > 0) {
          await tx.invoice.createMany({
            data: toCreate.map((s) => ({
              studentId: s.id,
              billingMonth,
              amount: s.monthlyFee,
              dueDate,
              issuedDate,
            })),
          });
        }

        return {
          created: toCreate.length,
          skipped: activeStudents.length - toCreate.length,
        };
      })
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}