import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db, withDbRetry } from '@/lib/db';

type RouteContext = { params: Promise<{ invoiceId: string }> };

type InvoiceWithStudent = Prisma.InvoiceGetPayload<{
  include: { student: { select: { name: true } } };
}>;

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function startOfUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function daysOverdueFor(dueDate: Date, isPaid: boolean): number {
  if (isPaid) return 0;
  const today = startOfUtcDay(new Date());
  const diff = Math.floor((today - startOfUtcDay(dueDate)) / MS_PER_DAY);
  return diff > 0 ? diff : 0;
}

function isNotFoundError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
}

function notFound() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

function serialize(invoice: InvoiceWithStudent) {
  const isPaid = invoice.status === 'paid';
  return {
    id: invoice.id,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
    studentId: invoice.studentId,
    billingMonth: invoice.billingMonth.toISOString().slice(0, 10),
    amount: invoice.amount.toNumber(),
    status: invoice.status,
    dueDate: invoice.dueDate.toISOString().slice(0, 10),
    paidAt: invoice.paidAt !== null ? invoice.paidAt.toISOString() : null,
    paidAmount: invoice.paidAmount !== null ? invoice.paidAmount.toNumber() : null,
    issuedDate: invoice.issuedDate !== null ? invoice.issuedDate.toISOString() : null,
    student_name: invoice.student.name,
    days_overdue: daysOverdueFor(invoice.dueDate, isPaid),
  };
}

function parseDateOnly(value: unknown): Date | null {
  if (typeof value !== 'string' || !DATE_ONLY_PATTERN.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  if (date.toISOString().slice(0, 10) !== value) return null;
  return date;
}

type ParsedPatch =
  | { ok: true; data: { amount?: number; dueDate?: Date; issuedDate?: Date | null } }
  | { ok: false; error: string };

function parsePatchBody(body: Record<string, unknown>): ParsedPatch {
  const data: { amount?: number; dueDate?: Date; issuedDate?: Date | null } = {};

  if (body.amount !== undefined) {
    const amount = body.amount;
    if (
      typeof amount !== 'number' ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      Math.round(amount * 100) / 100 !== amount
    ) {
      return { ok: false, error: 'Amount must be a positive number with at most 2 decimal places.' };
    }
    data.amount = amount;
  }

  if (body.dueDate !== undefined) {
    const dueDate = parseDateOnly(body.dueDate);
    if (!dueDate) {
      return { ok: false, error: 'Due date must be a valid date in YYYY-MM-DD format.' };
    }
    data.dueDate = dueDate;
  }

  if (body.issuedDate !== undefined) {
    if (body.issuedDate === null) {
      data.issuedDate = null;
    } else {
      const issuedDate = parseDateOnly(body.issuedDate);
      if (!issuedDate) {
        return { ok: false, error: 'Issued date must be a valid date in YYYY-MM-DD format.' };
      }
      data.issuedDate = issuedDate;
    }
  }

  if (Object.keys(data).length === 0) {
    return { ok: false, error: 'No valid fields provided to update.' };
  }

  return { ok: true, data };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { invoiceId } = await params;
  if (!UUID_PATTERN.test(invoiceId)) return notFound();

  try {
    const invoice = await withDbRetry(() =>
      db.invoice.findUnique({
        where: { id: invoiceId },
        include: { student: { select: { name: true } } },
      })
    );
    if (!invoice) return notFound();

    return NextResponse.json({ invoice: serialize(invoice) });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { invoiceId } = await params;
  if (!UUID_PATTERN.test(invoiceId)) return notFound();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: 'Request body must be an object' }, { status: 400 });
  }

  const parsed = parsePatchBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const existing = await withDbRetry(() =>
      db.invoice.findUnique({
        where: { id: invoiceId },
        select: { id: true, status: true, dueDate: true, issuedDate: true },
      })
    );
    if (!existing) return notFound();

    if (existing.status === 'paid') {
      return NextResponse.json(
        { error: 'Paid invoices cannot be changed' },
        { status: 409 },
      );
    }

    const nextDueDate = parsed.data.dueDate ?? existing.dueDate;
    const nextIssuedDate =
      parsed.data.issuedDate !== undefined ? parsed.data.issuedDate : existing.issuedDate;
    if (nextIssuedDate && nextDueDate.getTime() < nextIssuedDate.getTime()) {
      return NextResponse.json(
        { error: 'Due date cannot be before the issued date.' },
        { status: 400 },
      );
    }

    const invoice = await withDbRetry(() =>
      db.invoice.update({
        where: { id: invoiceId },
        data: parsed.data,
        include: { student: { select: { name: true } } },
      })
    );

    return NextResponse.json({ invoice: serialize(invoice) });
  } catch (error) {
    if (isNotFoundError(error)) return notFound();
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { invoiceId } = await params;
  if (!UUID_PATTERN.test(invoiceId)) return notFound();

  try {
    const existing = await withDbRetry(() =>
      db.invoice.findUnique({
        where: { id: invoiceId },
        select: { id: true, status: true },
      })
    );
    if (!existing) return notFound();

    if (existing.status === 'paid') {
      return NextResponse.json(
        { error: 'Paid invoices cannot be deleted' },
        { status: 409 },
      );
    }

    // Chase alerts are derived from unpaid invoices, so they are removed along with the row.
    await withDbRetry(() => db.invoice.delete({ where: { id: invoiceId } }));

    return NextResponse.json({ deleted: true });
  } catch (error) {
    if (isNotFoundError(error)) return notFound();
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}