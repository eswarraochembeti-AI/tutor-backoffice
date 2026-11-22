import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db, withDbRetry } from '@/lib/db';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const AMOUNT_FORMAT_RE = /^\d+(\.\d{1,2})?$/;
const DETAILS_MAX_LENGTH = 500;

type RouteContext = { params: Promise<{ billId: string }> };

type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

function parseAmount(value: unknown): ParseResult<number> {
  if (value === undefined || value === null || value === '') {
    return { ok: false, error: 'Enter the bill amount.' };
  }
  const text = typeof value === 'number' ? String(value) : typeof value === 'string' ? value.trim() : '';
  const num = Number(text);
  if (text === '' || !Number.isFinite(num)) {
    return { ok: false, error: 'Enter the bill amount.' };
  }
  if (num <= 0) {
    return { ok: false, error: 'Bill amount must be greater than 0.' };
  }
  if (!AMOUNT_FORMAT_RE.test(text)) {
    return { ok: false, error: 'Enter an amount with no more than two decimal places.' };
  }
  return { ok: true, value: num };
}

function parseCalendarDate(value: unknown): Date | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const date = new Date(value.trim());
  if (Number.isNaN(date.getTime())) return null;
  // Reject impossible dates such as 2025-02-30 that JavaScript would otherwise roll over.
  const datePart = value.trim().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart) && date.toISOString().slice(0, 10) !== datePart) {
    return null;
  }
  return date;
}

function parseDueDate(value: unknown): ParseResult<Date> {
  if (value === undefined || value === null || value === '') {
    return { ok: false, error: 'Choose a due date for this bill.' };
  }
  const date = parseCalendarDate(value);
  if (!date) {
    return { ok: false, error: 'Enter a valid due date.' };
  }
  return { ok: true, value: date };
}

function parseDetails(value: unknown): ParseResult<string | null> {
  if (value === undefined || value === null) return { ok: true, value: null };
  if (typeof value !== 'string') {
    return { ok: false, error: 'Bill details must be 500 characters or fewer.' };
  }
  const trimmed = value.trim();
  if (trimmed.length > DETAILS_MAX_LENGTH) {
    return { ok: false, error: 'Bill details must be 500 characters or fewer.' };
  }
  return { ok: true, value: trimmed === '' ? null : trimmed };
}

function parseTitle(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function parsePaidAt(value: unknown): ParseResult<Date | null> {
  if (value === undefined || value === null || value === '') return { ok: true, value: null };
  const date = parseCalendarDate(value);
  if (!date) return { ok: false, error: 'Enter a valid payment date.' };
  return { ok: true, value: date };
}

function isNotFoundError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
}

function notFound() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { billId } = await params;
  if (!UUID_RE.test(billId)) return notFound();

  try {
    const bill = await withDbRetry(() => db.bill.findUnique({ where: { id: billId } }));
    if (!bill) return notFound();
    return NextResponse.json({ bill });
  } catch (e) {
    console.error('GET /api/bills/[billId] failed', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { billId } = await params;
  if (!UUID_RE.test(billId)) return notFound();

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const data: Prisma.BillUpdateInput = {};

  if (body.amount !== undefined) {
    const amount = parseAmount(body.amount);
    if (!amount.ok) return NextResponse.json({ error: amount.error }, { status: 400 });
    data.amount = amount.value;
  }

  if (body.dueDate !== undefined) {
    const dueDate = parseDueDate(body.dueDate);
    if (!dueDate.ok) return NextResponse.json({ error: dueDate.error }, { status: 400 });
    data.dueDate = dueDate.value;
  }

  if (body.details !== undefined) {
    const details = parseDetails(body.details);
    if (!details.ok) return NextResponse.json({ error: details.error }, { status: 400 });
    data.details = details.value;
  }

  if (body.title !== undefined) {
    data.title = parseTitle(body.title);
  }

  if (body.paidAt !== undefined) {
    const paidAt = parsePaidAt(body.paidAt);
    if (!paidAt.ok) return NextResponse.json({ error: paidAt.error }, { status: 400 });
    data.paidAt = paidAt.value;
    data.status = paidAt.value ? 'paid' : 'unpaid';
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No changes provided' }, { status: 400 });
  }

  try {
    const bill = await withDbRetry(() => db.bill.update({ where: { id: billId }, data }));
    return NextResponse.json({ bill });
  } catch (e) {
    if (isNotFoundError(e)) return notFound();
    console.error('PATCH /api/bills/[billId] failed', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { billId } = await params;
  if (!UUID_RE.test(billId)) return notFound();

  try {
    await withDbRetry(() => db.bill.delete({ where: { id: billId } }));
    return NextResponse.json({ deleted: true });
  } catch (e) {
    if (isNotFoundError(e)) return notFound();
    console.error('DELETE /api/bills/[billId] failed', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}