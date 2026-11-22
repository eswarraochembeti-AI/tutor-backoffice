import { NextResponse, type NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { db, withDbRetry } from '@/lib/db';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ billId: string }> },
) {
  const { billId } = await params;
  if (!UUID_RE.test(billId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const bill = await withDbRetry(() => db.bill.findUnique({ where: { id: billId } }));
    if (!bill) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (bill.status !== 'paid') {
      return NextResponse.json(
        { error: 'Only a paid bill can be marked unpaid' },
        { status: 409 },
      );
    }

    const updated = await withDbRetry(() =>
      db.bill.update({
        where: { id: billId },
        data: { status: 'unpaid', paidAt: null },
      })
    );

    return NextResponse.json({ bill: updated });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}