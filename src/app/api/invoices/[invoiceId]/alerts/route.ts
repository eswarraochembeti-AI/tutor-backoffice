import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db, withDbRetry } from '@/lib/db';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function isValidIsoDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function daysBetweenTodayAnd(date: Date): number {
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dueUtc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.max(0, Math.floor((todayUtc - dueUtc) / DAY_MS));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const { invoiceId } = await params;

    if (!UUID_RE.test(invoiceId)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // The body is optional: an empty body means "alert today".
    // A body that is present but not valid JSON is the client's mistake.
    let rawText: string;
    try {
      rawText = await request.text();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    let body: Record<string, unknown> = {};
    if (rawText.trim() !== '') {
      try {
        const parsed: unknown = JSON.parse(rawText);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }
        body = parsed as Record<string, unknown>;
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
      }
    }

    let alertDate = todayIso();
    if (body.alert_date !== undefined && body.alert_date !== null) {
      if (typeof body.alert_date !== 'string' || !isValidIsoDate(body.alert_date)) {
        return NextResponse.json(
          { error: 'alert_date must be a valid date in YYYY-MM-DD format' },
          { status: 400 }
        );
      }
      alertDate = body.alert_date;
    }

    const invoice = await withDbRetry(() => db.invoice.findUnique({ where: { id: invoiceId } }));

    if (!invoice) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (invoice.status === 'paid' || invoice.paidAt !== null) {
      return NextResponse.json(
        { error: 'A paid invoice cannot have a chase alert' },
        { status: 409 }
      );
    }

    const daysOverdue = daysBetweenTodayAnd(invoice.dueDate);

    const alert = {
      id: `${invoice.id}:${alertDate}`,
      invoiceId: invoice.id,
      alertDate,
      status: 'active' as const,
      message: 'Chase this invoice today',
      amountOwed: Number(invoice.amount),
      daysOverdue,
      dueDate: invoice.dueDate.toISOString().slice(0, 10),
    };

    return NextResponse.json({ alert }, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}