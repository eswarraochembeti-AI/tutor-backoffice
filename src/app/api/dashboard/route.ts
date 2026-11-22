import { NextResponse } from 'next/server';
import { db, withDbRetry } from '@/lib/db';

export const dynamic = 'force-dynamic';

const DAY_MS = 86_400_000;

interface StudentOwing {
  student_id: string;
  name: string;
  amount_owed: number;
  oldest_due: number;
  due_in_days?: number;
}

function startOfTodayUtc(): number {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

function toUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function GET() {
  try {
    const today = startOfTodayUtc();

    const unpaidInvoices = await withDbRetry(() =>
      db.invoice.findMany({
        where: { status: 'issued' },
        select: {
          studentId: true,
          amount: true,
          dueDate: true,
          student: { select: { name: true } },
        },
      })
    );

    const byStudent = new Map<string, StudentOwing>();
    let totalOutstanding = 0;

    for (const invoice of unpaidInvoices) {
      const amount = invoice.amount.toNumber();
      const dueDay = toUtcDay(invoice.dueDate);
      totalOutstanding += amount;

      const existing = byStudent.get(invoice.studentId);
      if (!existing) {
        byStudent.set(invoice.studentId, {
          student_id: invoice.studentId,
          name: invoice.student.name,
          amount_owed: amount,
          oldest_due: dueDay,
        });
      } else {
        existing.amount_owed += amount;
        if (dueDay < existing.oldest_due) {
          existing.oldest_due = dueDay;
        }
      }
    }

    const students = Array.from(byStudent.values())
      .map((entry) => {
        const daysOverdue = Math.floor((today - entry.oldest_due) / DAY_MS);
        return {
          student_id: entry.student_id,
          name: entry.name,
          amount_owed: round2(entry.amount_owed),
          days_overdue: Math.max(0, daysOverdue),
          due_in_days: Math.max(0, Math.floor((entry.oldest_due - today) / DAY_MS)),
        };
      })
      .sort(
        (a, b) =>
          b.days_overdue - a.days_overdue || b.amount_owed - a.amount_owed,
      );

    return NextResponse.json(
      {
        dashboard: {
          total_outstanding: round2(totalOutstanding),
          students,
        },
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}