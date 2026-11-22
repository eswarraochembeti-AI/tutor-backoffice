import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db, withDbRetry } from '@/lib/db';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ billId: string }> }
) {
  const { billId } = await params;

  if (!UUID_PATTERN.test(billId)) {
    return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
  }

  try {
    const existing = await withDbRetry(() => db.bill.findUnique({ where: { id: billId } }));

    if (!existing) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    if (existing.status === 'paid') {
      return NextResponse.json(
        { error: 'Bill is already paid' },
        { status: 409 }
      );
    }

    const bill = await withDbRetry(() =>
      db.bill.update({
        where: { id: billId },
        data: {
          status: 'paid',
          paidAt: new Date(),
        },
      })
    );

    return NextResponse.json({ bill });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}