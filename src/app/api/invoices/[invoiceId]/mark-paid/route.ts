import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db, withDbRetry } from '@/lib/db';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await params;

  if (!UUID_PATTERN.test(invoiceId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { paid_at, paid_amount } = body as {
    paid_at?: unknown;
    paid_amount?: unknown;
  };

  if (typeof paid_at !== 'string' || paid_at.trim() === '') {
    return NextResponse.json(
      { error: 'Missing required field: paid_at' },
      { status: 400 }
    );
  }

  const paidAt = new Date(paid_at);
  if (Number.isNaN(paidAt.getTime())) {
    return NextResponse.json(
      { error: 'paid_at must be a valid date' },
      { status: 400 }
    );
  }

  if (
    typeof paid_amount !== 'number' ||
    !Number.isFinite(paid_amount) ||
    paid_amount < 0
  ) {
    return NextResponse.json(
      { error: 'paid_amount must be a non-negative number' },
      { status: 400 }
    );
  }

  try {
    // Atomic guard: only an invoice that is still issued (unpaid/overdue) can be marked paid.
    const result = await withDbRetry(() =>
      db.invoice.updateMany({
        where: { id: invoiceId, status: 'issued' },
        data: {
          status: 'paid',
          paidAt,
          paidAmount: new Prisma.Decimal(paid_amount),
        },
      })
    );

    if (result.count === 0) {
      const exists = await withDbRetry(() =>
        db.invoice.findUnique({
          where: { id: invoiceId },
          select: { id: true },
        })
      );
      if (!exists) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json(
        { error: 'Invoice is already paid' },
        { status: 409 }
      );
    }

    const invoice = await withDbRetry(() =>
      db.invoice.findUnique({
        where: { id: invoiceId },
      })
    );

    if (!invoice) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2025'
    ) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}