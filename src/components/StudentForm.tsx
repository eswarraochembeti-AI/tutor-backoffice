
'use client';

import { useState, type FormEvent } from 'react';

export type StudentStatusValue = 'active' | 'paused' | 'ended';

export interface StudentFormValues {
  name: string;
  guardian: string;
  email: string;
  phone: string;
  monthlyFee: number;
  startDate: string;
  status: StudentStatusValue;
}

interface StudentFormProps {
  initialValues?: Partial<StudentFormValues>;
  submitLabel?: string;
  submitting?: boolean;
  onSubmit: (values: StudentFormValues) => void | Promise<void>;
  onCancel: () => void;
}

interface FormState {
  name: string;
  guardian: string;
  email: string;
  phone: string;
  monthlyFee: string;
  startDate: string;
  status: StudentStatusValue;
}

type FieldErrors = Partial<Record<keyof FormState | 'contact', string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CHARS_RE = /^[0-9+\-() ]+$/;
const FEE_RE = /^\d+(\.\d{1,2})?$/;

const labelClass = 'mb-1 block text-sm font-medium text-foreground';
const inputClass =
  'w-full min-w-0 rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring';
const errorClass = 'mt-1 text-xs text-destructive';

function toFormState(v?: Partial<StudentFormValues>): FormState {
  return {
    name: v?.name ?? '',
    guardian: v?.guardian ?? '',
    email: v?.email ?? '',
    phone: v?.phone ?? '',
    monthlyFee: v?.monthlyFee !== undefined ? String(v.monthlyFee) : '',
    startDate: v?.startDate ?? '',
    status: v?.status ?? 'active',
  };
}

function validate(f: FormState): FieldErrors {
  const errors: FieldErrors = {};
  const name = f.name.trim();
  const email = f.email.trim();
  const phone = f.phone.trim();
  const fee = f.monthlyFee.trim();

  if (!name) errors.name = "Please enter the student's name.";
  else if (name.length > 100) errors.name = 'Student name must be 100 characters or fewer.';

  if (email && !EMAIL_RE.test(email)) {
    errors.email = 'Please enter a valid email address, such as name@example.com.';
  }

  if (phone) {
    const digits = phone.replace(/\D/g, '').length;
    if (!PHONE_CHARS_RE.test(phone) || digits < 7 || digits > 15) {
      errors.phone = 'Please enter a valid phone number using digits only, with 7 to 15 numbers.';
    }
  }

  if (!email && !phone) {
    errors.contact = 'Please enter an email address or a phone number so you can chase late payments.';
  }

  if (!fee) {
    errors.monthlyFee = "Please enter the student's monthly fee.";
  } else if (!FEE_RE.test(fee) || Number(fee) <= 0 || Number(fee) > 100000) {
    errors.monthlyFee = 'Please enter a monthly fee greater than 0, up to two decimal places.';
  }

  if (!f.startDate) errors.startDate = "Please enter the student's start date.";

  return errors;
}

export default function StudentForm({
  initialValues,
  submitLabel = 'Save student',
  submitting = false,
  onSubmit,
  onCancel,
}: StudentFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(initialValues));
  const [errors, setErrors] = useState<FieldErrors>({});

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    void onSubmit({
      name: form.name.trim(),
      guardian: form.guardian.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      monthlyFee: Number(form.monthlyFee),
      startDate: form.startDate,
      status: form.status,
    });
  }

  return (
    <form data-nexen-component="nx_components_StudentForm"
      onSubmit={handleSubmit}
      noValidate
      className="w-full max-w-xl space-y-5 rounded-[var(--radius)] border border-border bg-card p-4 text-foreground shadow-sm sm:p-6"
     data-nexen-id="nx-f43822f4-0">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="min-w-0 sm:col-span-2">
          <label htmlFor="student-name" className={labelClass} data-nexen-id="nx-f43822f4-1">Student name</label>
          <input
            id="student-name"
            className={inputClass}
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            aria-invalid={!!errors.name}
           data-nexen-id="nx-f43822f4-2"/>
          {errors.name && <p className={errorClass} data-nexen-id="nx-f43822f4-3">{errors.name}</p>}
        </div>

        <div className="min-w-0 sm:col-span-2">
          <label htmlFor="student-guardian" className={labelClass} data-nexen-id="nx-f43822f4-4">Guardian (optional)</label>
          <input
            id="student-guardian"
            className={inputClass}
            value={form.guardian}
            onChange={(e) => update('guardian', e.target.value)}
           data-nexen-id="nx-f43822f4-5"/>
        </div>

        <div className="min-w-0">
          <label htmlFor="student-email" className={labelClass} data-nexen-id="nx-f43822f4-6">Email</label>
          <input
            id="student-email"
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            aria-invalid={!!errors.email}
           data-nexen-id="nx-f43822f4-7"/>
          {errors.email && <p className={errorClass} data-nexen-id="nx-f43822f4-8">{errors.email}</p>}
        </div>

        <div className="min-w-0">
          <label htmlFor="student-phone" className={labelClass} data-nexen-id="nx-f43822f4-9">Phone</label>
          <input
            id="student-phone"
            type="tel"
            className={inputClass}
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            aria-invalid={!!errors.phone}
           data-nexen-id="nx-f43822f4-10"/>
          {errors.phone && <p className={errorClass} data-nexen-id="nx-f43822f4-11">{errors.phone}</p>}
        </div>

        {errors.contact && <p className={`${errorClass} sm:col-span-2`} data-nexen-id="nx-f43822f4-12">{errors.contact}</p>}

        <div className="min-w-0">
          <label htmlFor="student-fee" className={labelClass} data-nexen-id="nx-f43822f4-13">Monthly fee (₹)</label>
          <input
            id="student-fee"
            inputMode="decimal"
            className={inputClass}
            value={form.monthlyFee}
            onChange={(e) => update('monthlyFee', e.target.value)}
            aria-invalid={!!errors.monthlyFee}
           data-nexen-id="nx-f43822f4-14"/>
          {errors.monthlyFee && <p className={errorClass} data-nexen-id="nx-f43822f4-15">{errors.monthlyFee}</p>}
        </div>

        <div className="min-w-0">
          <label htmlFor="student-start" className={labelClass} data-nexen-id="nx-f43822f4-16">Start date</label>
          <input
            id="student-start"
            type="date"
            className={inputClass}
            value={form.startDate}
            onChange={(e) => update('startDate', e.target.value)}
            aria-invalid={!!errors.startDate}
           data-nexen-id="nx-f43822f4-17"/>
          {errors.startDate && <p className={errorClass} data-nexen-id="nx-f43822f4-18">{errors.startDate}</p>}
        </div>

        <div className="min-w-0 sm:col-span-2">
          <label htmlFor="student-status" className={labelClass} data-nexen-id="nx-f43822f4-19">Status</label>
          <select
            id="student-status"
            className={inputClass}
            value={form.status}
            onChange={(e) => update('status', e.target.value as StudentStatusValue)}
           data-nexen-id="nx-f43822f4-20">
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="ended">Ended</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[var(--radius)] border border-border px-4 py-2 text-sm font-medium text-foreground"
         data-nexen-id="nx-f43822f4-21">
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-[var(--radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
         data-nexen-id="nx-f43822f4-22">
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}