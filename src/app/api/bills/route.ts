
import { NextResponse } from 'next/server';
import type { Bill } from '@prisma/client';
import { db, withDbRetry } from '@/lib/db';

export const dynamic = 'force-dynamic';

const MAX_DETAILS_LENGTH = 500;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

type ValidBillInput = {
  title: string | null;
  amount: string;
  dueDate: Date;
  details: string | null;
};

type ParseResult = { data: ValidBillInput } | { error: string };

function serializeBill(bill: Bill) {
  return {
    id: bill.id,
    createdAt: bill.createdAt.toISOString(),
    updatedAt: bill.updatedAt.toISOString(),
    amount: Number(bill.amount.toString()),
    dueDate: bill.dueDate.toISOString().slice(0, 10),
    status: bill.status,
    details: bill.details,
    paidAt: bill.paidAt ? bill.paidAt.toISOString() : null,
    title: bill.title,
  };
}

function parseBillInput(body: unknown): ParseResult {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { error: 'Enter the bill amount.' };
  }
  const input = body as Record<string, unknown>;

  // Amount
  const rawAmount = input.amount;
  if (rawAmount === undefined || rawAmount === null || rawAmount === '') {
    return { error: 'Enter the bill amount.' };
  }
  const amountNumber =
    typeof rawAmount === 'number'
      ? rawAmount
      : typeof rawAmount === 'string'
        ? Number(rawAmount.trim())
        : NaN;
  if (!Number.isFinite(amountNumber)) {
    return { error: 'Enter the bill amount.' };
  }
  if (amountNumber <= 0) {
    return { error: 'Bill amount must be greater than 0.' };
  }
  const amountText = typeof rawAmount === 'number' ? String(rawAmount) : String(rawAmount).trim();
  if (!AMOUNT_PATTERN.test(amountText)) {
    return { error: 'Enter an amount with no more than two decimal places.' };
  }

  // Due date
  const rawDueDate = input.dueDate;
  if (rawDueDate === undefined || rawDueDate === null || rawDueDate === '') {
    return { error: 'Choose a due date for this bill.' };
  }
  if (typeof rawDueDate !== 'string' || !DATE_PATTERN.test(rawDueDate.trim())) {
    return { error: 'Enter a valid due date.' };
  }
  const dueDateText = rawDueDate.trim();
  const dueDate = new Date(`${dueDateText}T00:00:00.000Z`);
  if (Number.isNaN(dueDate.getTime()) || dueDate.toISOString().slice(0, 10) !== dueDateText) {
    return { error: 'Enter a valid due date.' };
  }

  // Title (optional)
  let title: string | null = null;
  if (input.title !== undefined && input.title !== null) {
    if (typeof input.title !== 'string') {
      return { error: 'Enter a valid bill title.' };
    }
    const trimmedTitle = input.title.trim();
    title = trimmedTitle === '' ? null : trimmedTitle;
  }

  // Details (optional, max 500 characters)
  let details: string | null = null;
  if (input.details !== undefined && input.details !== null) {
    if (typeof input.details !== 'string') {
      return { error: `Bill details must be ${MAX_DETAILS_LENGTH} characters or fewer.` };
    }
    const trimmedDetails = input.details.trim();
    if (trimmedDetails.length > MAX_DETAILS_LENGTH) {
      return { error: `Bill details must be ${MAX_DETAILS_LENGTH} characters or fewer.` };
    }
    details = trimmedDetails === '' ? null : trimmedDetails;
  }

  return {
    data: {
      title,
      amount: amountText,
      dueDate,
      details,
    },
  };
}

export async function GET() {
  try {
    const bills = await withDbRetry(() =>
      db.bill.findMany({
        orderBy: { dueDate: 'asc' },
      })
    );
    return NextResponse.json({ bills: bills.map(serializeBill) });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = parseBillInput(body);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const bill = await withDbRetry(() =>
      db.bill.create({
        data: {
          title: parsed.data.title,
          amount: parsed.data.amount,
          dueDate: parsed.data.dueDate,
          details: parsed.data.details,
        },
      })
    );
    return NextResponse.json({ bill: serializeBill(bill) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}