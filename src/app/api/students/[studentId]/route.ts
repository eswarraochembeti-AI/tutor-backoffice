import { NextRequest, NextResponse } from 'next/server';
import { Prisma, StudentStatus } from '@prisma/client';
import { db, withDbRetry } from '@/lib/db';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CHARS_PATTERN = /^[0-9+\-() ]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const FEE_PATTERN = /^\d+(\.\d{1,2})?$/;

type RouteContext = { params: Promise<{ studentId: string }> };

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function handleDbError(error: unknown, context: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  console.error(`[students/${context}]`, error);
  return NextResponse.json({ error: 'Internal error' }, { status: 500 });
}

function validateName(value: unknown): { value?: string; error?: string } {
  if (typeof value !== 'string' || value.trim() === '') {
    return { error: "Please enter the student's name." };
  }
  const trimmed = value.trim();
  if (trimmed.length > 100) {
    return { error: 'Student name must be 100 characters or fewer.' };
  }
  return { value: trimmed };
}

function validateEmail(value: unknown): { value?: string | null; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { value: null };
  }
  if (typeof value !== 'string') {
    return { error: 'Please enter a valid email address, such as name@example.com.' };
  }
  const trimmed = value.trim();
  if (trimmed === '') return { value: null };
  if (!EMAIL_PATTERN.test(trimmed)) {
    return { error: 'Please enter a valid email address, such as name@example.com.' };
  }
  return { value: trimmed };
}

function validatePhone(value: unknown): { value?: string | null; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { value: null };
  }
  if (typeof value !== 'string') {
    return { error: 'Please enter a valid phone number using digits only, with 7 to 15 numbers.' };
  }
  const trimmed = value.trim();
  if (trimmed === '') return { value: null };
  const digitCount = (trimmed.match(/\d/g) ?? []).length;
  if (!PHONE_CHARS_PATTERN.test(trimmed) || digitCount < 7 || digitCount > 15) {
    return { error: 'Please enter a valid phone number using digits only, with 7 to 15 numbers.' };
  }
  return { value: trimmed };
}

function validateGuardian(value: unknown): { value?: string | null; error?: string } {
  if (value === null || value === undefined) return { value: null };
  if (typeof value !== 'string') return { error: 'Guardian name must be text.' };
  const trimmed = value.trim();
  if (trimmed.length > 100) return { error: 'Guardian name must be 100 characters or fewer.' };
  return { value: trimmed === '' ? null : trimmed };
}

function validateMonthlyFee(value: unknown): { value?: string; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { error: "Please enter the student's monthly fee." };
  }
  const asString = typeof value === 'number' ? value.toString() : typeof value === 'string' ? value.trim() : '';
  const numeric = Number(asString);
  if (
    asString === '' ||
    !Number.isFinite(numeric) ||
    !FEE_PATTERN.test(asString) ||
    numeric <= 0 ||
    numeric > 100000
  ) {
    return { error: 'Please enter a monthly fee greater than 0, up to two decimal places.' };
  }
  return { value: numeric.toFixed(2) };
}

function validateStatus(value: unknown): { value?: StudentStatus; error?: string } {
  const allowed = Object.values(StudentStatus) as string[];
  if (typeof value !== 'string' || !allowed.includes(value)) {
    return { error: `Status must be one of: ${allowed.join(', ')}.` };
  }
  return { value: value as StudentStatus };
}

function validateStartDate(value: unknown): { value?: Date; error?: string } {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    return { error: 'Start date must be in the format YYYY-MM-DD.' };
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return { error: 'Start date must be a valid date.' };
  }
  return { value: parsed };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { studentId } = await context.params;
  if (!isUuid(studentId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const student = await withDbRetry(() => db.student.findUnique({ where: { id: studentId } }));
    if (!student) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ student });
  } catch (error) {
    return handleDbError(error, 'GET');
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { studentId } = await context.params;
  if (!isUuid(studentId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const data: Prisma.StudentUpdateInput = {};

  if (body.name !== undefined) {
    const result = validateName(body.name);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    data.name = result.value;
  }

  if (body.email !== undefined) {
    const result = validateEmail(body.email);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    data.email = result.value;
  }

  if (body.phone !== undefined) {
    const result = validatePhone(body.phone);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    data.phone = result.value;
  }

  if (body.guardian !== undefined) {
    const result = validateGuardian(body.guardian);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    data.guardian = result.value;
  }

  if (body.monthlyFee !== undefined) {
    const result = validateMonthlyFee(body.monthlyFee);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    data.monthlyFee = result.value;
  }

  if (body.status !== undefined) {
    const result = validateStatus(body.status);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    data.status = result.value;
  }

  if (body.startDate !== undefined) {
    const result = validateStartDate(body.startDate);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    data.startDate = result.value;
  }

  try {
    const existing = await withDbRetry(() => db.student.findUnique({ where: { id: studentId } }));
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const finalEmail = data.email !== undefined ? data.email : existing.email;
    const finalPhone = data.phone !== undefined ? data.phone : existing.phone;
    if (!finalEmail && !finalPhone) {
      return NextResponse.json(
        { error: 'Please provide an email address or a phone number so the tutor can chase late payments.' },
        { status: 400 },
      );
    }

    // Fee changes only affect invoices generated afterwards; existing invoices are not touched here.
    const student = await withDbRetry(() =>
      db.student.update({
        where: { id: studentId },
        data,
      })
    );
    return NextResponse.json({ student });
  } catch (error) {
    return handleDbError(error, 'PATCH');
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { studentId } = await context.params;
  if (!isUuid(studentId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    // Invoices with status "issued" are the unpaid or overdue ones.
    const openInvoiceCount = await withDbRetry(() =>
      db.invoice.count({
        where: { studentId, status: 'issued' },
      })
    );
    if (openInvoiceCount > 0) {
      return NextResponse.json(
        {
          error:
            'This student has unpaid or overdue invoices and cannot be deleted. Set the status to ended instead.',
        },
        { status: 409 },
      );
    }

    await withDbRetry(() => db.student.delete({ where: { id: studentId } }));
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return handleDbError(error, 'DELETE');
  }
}