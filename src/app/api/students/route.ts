import { NextRequest, NextResponse } from 'next/server';
import { db, withDbRetry } from '@/lib/db';

const NAME_MAX = 100;
const SEARCH_MAX = 100;
const FEE_MAX = 100000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CHARS_PATTERN = /^[0-9+\-() ]+$/;
const FEE_PATTERN = /^\d+(\.\d{1,2})?$/;

type StudentRecord = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  monthlyFee: { toString(): string };
  status: string;
  startDate: Date;
  email: string | null;
  phone: string | null;
  guardian: string | null;
};

function toStudentJson(student: StudentRecord) {
  return {
    id: student.id,
    createdAt: student.createdAt.toISOString(),
    updatedAt: student.updatedAt.toISOString(),
    name: student.name,
    monthlyFee: Number(student.monthlyFee.toString()),
    status: student.status,
    startDate: student.startDate.toISOString().slice(0, 10),
    email: student.email,
    phone: student.phone,
    guardian: student.guardian,
  };
}

function optionalText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

type ValidationResult =
  | {
      ok: true;
      data: {
        name: string;
        monthlyFee: string;
        startDate: Date;
        email: string | null;
        phone: string | null;
        guardian: string | null;
      };
    }
  | { ok: false; error: string };

function validateStudentInput(input: Record<string, unknown>): ValidationResult {
  // Name
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (name === '') {
    return { ok: false, error: "Please enter the student's name." };
  }
  if (name.length > NAME_MAX) {
    return { ok: false, error: 'Student name must be 100 characters or fewer.' };
  }

  // Monthly fee
  const rawFee = input.monthlyFee;
  if (rawFee === undefined || rawFee === null || rawFee === '') {
    return { ok: false, error: "Please enter the student's monthly fee." };
  }
  if (typeof rawFee !== 'number' && typeof rawFee !== 'string') {
    return { ok: false, error: 'Please enter the monthly fee amount.' };
  }
  const feeText = String(rawFee).trim();
  if (feeText === '' || Number.isNaN(Number(feeText))) {
    return { ok: false, error: 'Please enter the monthly fee amount.' };
  }
  if (!FEE_PATTERN.test(feeText)) {
    return {
      ok: false,
      error: 'Please enter a monthly fee greater than 0, up to two decimal places.',
    };
  }
  const feeValue = Number(feeText);
  if (feeValue <= 0 || feeValue > FEE_MAX) {
    return {
      ok: false,
      error: 'Please enter a monthly fee greater than 0, up to two decimal places.',
    };
  }

  // Email
  const email = optionalText(input.email);
  if (email !== null && !EMAIL_PATTERN.test(email)) {
    return {
      ok: false,
      error: 'Please enter a valid email address, such as name@example.com.',
    };
  }

  // Phone
  const phone = optionalText(input.phone);
  if (phone !== null) {
    const digitCount = phone.replace(/\D/g, '').length;
    if (!PHONE_CHARS_PATTERN.test(phone) || digitCount < 7 || digitCount > 15) {
      return {
        ok: false,
        error: 'Please enter a valid phone number using digits only, with 7 to 15 numbers.',
      };
    }
  }

  // At least one contact method
  if (email === null && phone === null) {
    return {
      ok: false,
      error: 'Please enter an email address or phone number so you can follow up on payments.',
    };
  }

  // Guardian (optional)
  const guardian = optionalText(input.guardian);

  // Start date (optional, defaults to today on the server)
  let startDate: Date;
  const rawStart = optionalText(input.startDate);
  if (rawStart === null) {
    const now = new Date();
    startDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
  } else {
    startDate = new Date(rawStart);
    if (Number.isNaN(startDate.getTime())) {
      return { ok: false, error: 'Please enter a valid start date.' };
    }
  }

  return {
    ok: true,
    data: {
      name,
      monthlyFee: feeText,
      startDate,
      email,
      phone,
      guardian,
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const rawQuery = request.nextUrl.searchParams.get('q') ?? '';
    const q = rawQuery.trim();

    if (q.length > SEARCH_MAX) {
      return NextResponse.json(
        { error: 'Search is limited to 100 characters.' },
        { status: 400 },
      );
    }

    const students = await withDbRetry(() =>
      db.student.findMany({
        where: q
          ? { name: { contains: q, mode: 'insensitive' } }
          : undefined,
        orderBy: { name: 'asc' },
      })
    );

    return NextResponse.json({
      students: students.map(toStudentJson),
    });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json(
      { error: 'Request body must be a JSON object.' },
      { status: 400 },
    );
  }

  const validation = validateStudentInput(body as Record<string, unknown>);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const student = await withDbRetry(() =>
      db.student.create({
        data: {
          name: validation.data.name,
          monthlyFee: validation.data.monthlyFee,
          status: 'active',
          startDate: validation.data.startDate,
          email: validation.data.email,
          phone: validation.data.phone,
          guardian: validation.data.guardian,
        },
      })
    );

    return NextResponse.json({ student: toStudentJson(student) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}