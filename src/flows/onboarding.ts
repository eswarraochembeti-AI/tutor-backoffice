'use client';

import { createBill, getBills, getInvoices } from '@/lib/api';
import type { Bill } from '@/types/bill';
import type { Invoice } from '@/types/invoice';

/**
 * Flows: "Add Bill for Cash Flow" and "Review Cash Flow Forecast".
 * Pure business logic and validation. No React, no outside services.
 */

const DAY_MS = 86_400_000;
const MAX_TITLE_LENGTH = 120;
const MAX_DETAILS_LENGTH = 500;
const MAX_BILL_AMOUNT = 1_000_000;

export const FORECAST_WINDOWS = [
  { key: 'd30', label: '0–30 days', fromDay: 0, toDay: 30 },
  { key: 'd60', label: '31–60 days', fromDay: 31, toDay: 60 },
  { key: 'd90', label: '61–90 days', fromDay: 61, toDay: 90 },
] as const;

export interface BillDraft {
  title: string;
  amount: string | number;
  dueDate: string;
  details?: string | null;
}

export interface ValidatedBill {
  title: string;
  amount: number;
  dueDate: string;
  details: string;
}

export type BillDraftField = 'title' | 'amount' | 'dueDate' | 'details' | 'form';

export type BillDraftErrors = Partial<Record<BillDraftField, string>>;

export type BillValidationResult =
  | { ok: true; value: ValidatedBill; warnings: string[] }
  | { ok: false; errors: BillDraftErrors };

export type SubmitBillResult =
  | { ok: true; bill: Bill; warnings: string[] }
  | { ok: false; errors: BillDraftErrors };

export interface ForecastWindow {
  key: string;
  label: string;
  fromDay: number;
  toDay: number;
  cashIn: number;
  cashOut: number;
  net: number;
  balance: number;
}

export interface CashFlowForecast {
  openingBalance: number;
  windows: ForecastWindow[];
}

type ForecastInvoice = Pick<Invoice, 'amount' | 'dueDate' | 'status' | 'paidAt' | 'paidAmount'>;
type ForecastBill = Pick<Bill, 'amount' | 'dueDate' | 'status' | 'paidAt'>;

/** Parses a strict YYYY-MM-DD calendar date into a UTC day number, or null if invalid. */
function parseDateOnly(value: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return ms / DAY_MS;
}

/** Converts a Date or ISO/date string into a UTC day number. Returns NaN when unreadable. */
function toDayNumber(value: string | Date): number {
  if (value instanceof Date) {
    return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()) / DAY_MS;
  }
  const parsed = parseDateOnly(String(value).slice(0, 10));
  return parsed ?? Number.NaN;
}

function parseAmount(raw: string | number): number {
  const text = typeof raw === 'number' ? String(raw) : raw.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return Number.NaN;
  return Number(text);
}

function toMoney(value: unknown): number {
  const parsed = Number(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function isSettled(status: string | null | undefined, paidAt: unknown): boolean {
  return status === 'paid' || (paidAt !== null && paidAt !== undefined);
}

/** Maps an offset in days from today to a forecast window index, or -1 if outside 90 days. */
function windowIndex(offsetDays: number): number {
  if (offsetDays <= 30) return 0; // includes overdue items (negative offsets)
  if (offsetDays <= 60) return 1;
  if (offsetDays <= 90) return 2;
  return -1;
}

/** Validates a bill entered in the "Add Bill for Cash Flow" form. Runs on submit. */
export function validateBillDraft(
  draft: BillDraft,
  today: Date = new Date(),
): BillValidationResult {
  const todayDay = toDayNumber(today);
  if (Number.isNaN(todayDay)) {
    return { ok: false, errors: { form: 'The current date is invalid.' } };
  }

  const errors: BillDraftErrors = {};

  const title = draft.title.trim();
  if (!title) {
    errors.title = 'Enter a title for this bill.';
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.title = `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`;
  }

  const amount = parseAmount(draft.amount);
  if (Number.isNaN(amount)) {
    errors.amount = 'Enter an amount with up to 2 decimals, for example 120.50.';
  } else if (amount <= 0) {
    errors.amount = 'Amount must be greater than zero.';
  } else if (amount > MAX_BILL_AMOUNT) {
    errors.amount = `Amount must be ${MAX_BILL_AMOUNT.toLocaleString('en-IN')} or less.`;
  }

  const dueDay = parseDateOnly(draft.dueDate);
  if (dueDay === null) {
    errors.dueDate = 'Choose a valid due date.';
  }

  const details = (draft.details ?? '').trim();
  if (details.length > MAX_DETAILS_LENGTH) {
    errors.details = `Notes must be ${MAX_DETAILS_LENGTH} characters or fewer.`;
  }

  if (Object.keys(errors).length > 0 || dueDay === null) {
    return { ok: false, errors };
  }

  const warnings: string[] = [];
  const offset = dueDay - todayDay;
  if (offset < 0) {
    warnings.push('This bill is already past its due date and will count in the 0–30 day window.');
  } else if (offset > 90) {
    warnings.push('This bill is due after the 90-day forecast window and will not be counted.');
  }

  return {
    ok: true,
    value: { title, amount, dueDate: draft.dueDate.trim(), details },
    warnings,
  };
}

/** Submit flow for "Add Bill for Cash Flow": validate first, then create the bill. */
export async function submitBill(
  draft: BillDraft,
  today: Date = new Date(),
): Promise<SubmitBillResult> {
  const validation = validateBillDraft(draft, today);
  if (!validation.ok) {
    return { ok: false, errors: validation.errors };
  }

  const { value, warnings } = validation;
  try {
    const bill = await createBill({
      title: value.title,
      amount: value.amount,
      dueDate: value.dueDate,
      status: 'unpaid',
      ...(value.details ? { details: value.details } : {}),
    });
    return { ok: true, bill, warnings };
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : 'The bill could not be saved. Please try again.';
    return { ok: false, errors: { form: message } };
  }
}

/**
 * Builds the 30/60/90 day cash flow forecast from open invoices and unpaid bills.
 * - Open invoices count as cash in, at their outstanding amount, on their due date.
 * - Unpaid bills count as cash out on their due date.
 * - Overdue items fall into the 0–30 day window.
 * - Items due after day 90 are excluded.
 */
export function buildCashFlowForecast(input: {
  invoices: ForecastInvoice[];
  bills: ForecastBill[];
  today?: Date;
  openingBalance?: number;
}): CashFlowForecast {
  const today = input.today ?? new Date();
  const todayDay = toDayNumber(today);
  if (Number.isNaN(todayDay)) {
    throw new Error('Cannot build the forecast: the reference date is invalid.');
  }

  const windows: ForecastWindow[] = FORECAST_WINDOWS.map((window) => ({
    ...window,
    cashIn: 0,
    cashOut: 0,
    net: 0,
    balance: 0,
  }));

  for (const invoice of input.invoices) {
    if (isSettled(invoice.status, invoice.paidAt)) continue;
    const dueDay = toDayNumber(invoice.dueDate);
    if (Number.isNaN(dueDay)) continue;
    const index = windowIndex(dueDay - todayDay);
    if (index === -1) continue;
    const outstanding = Math.max(0, toMoney(invoice.amount) - toMoney(invoice.paidAmount ?? 0));
    windows[index].cashIn += outstanding;
  }

  for (const bill of input.bills) {
    if (isSettled(bill.status, bill.paidAt)) continue;
    const dueDay = toDayNumber(bill.dueDate);
    if (Number.isNaN(dueDay)) continue;
    const index = windowIndex(dueDay - todayDay);
    if (index === -1) continue;
    windows[index].cashOut += toMoney(bill.amount);
  }

  const openingBalance = input.openingBalance ?? 0;
  let balance = openingBalance;
  for (const window of windows) {
    window.cashIn = round2(window.cashIn);
    window.cashOut = round2(window.cashOut);
    window.net = round2(window.cashIn - window.cashOut);
    balance = round2(balance + window.net);
    window.balance = balance;
  }

  return { openingBalance, windows };
}

/** Review flow for "Review Cash Flow Forecast": loads invoices and bills, then builds the forecast. */
export async function reviewCashFlowForecast(today: Date = new Date()): Promise<CashFlowForecast> {
  const [invoices, bills] = await Promise.all([getInvoices(), getBills()]);
  return buildCashFlowForecast({ invoices, bills, today });
}