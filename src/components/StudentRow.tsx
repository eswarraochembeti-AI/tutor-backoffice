
import Link from 'next/link';
import type { Student } from '@/types/student';

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-primary/10 text-primary' },
  paused: { label: 'Paused', className: 'bg-secondary text-secondary-foreground' },
  ended: { label: 'Ended', className: 'bg-muted text-muted-foreground' },
};

function formatFee(value: unknown): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) ?? '' : '';
  return (first + last).toUpperCase();
}

export default function StudentRow({ student }: { student: Student }) {
  if (!student) return null;

  const name = typeof student.name === 'string' && student.name.trim() !== '' ? student.name : 'Unnamed student';
  const contactParts = [student.email, student.phone].filter(
    (part): part is string => typeof part === 'string' && part.trim() !== '',
  );
  const contact = contactParts.length > 0 ? contactParts.join(' · ') : 'No contact details';

  const statusKey = typeof student.status === 'string' ? student.status : 'active';
  const status = STATUS_STYLES[statusKey] ?? STATUS_STYLES.active;

  return (
    <li data-nexen-component="nx_components_StudentRow" className="list-none" data-nexen-id="nx-634b294b-0">
      <Link
        href={`/students/${student.id}`}
        className="flex flex-col gap-3 rounded-[var(--radius)] border bg-card p-4 shadow-sm transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:gap-4 sm:p-5"
       data-nexen-id="nx-634b294b-1">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span
            aria-hidden="true"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground"
           data-nexen-id="nx-634b294b-2">
            {getInitials(name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="break-words text-base font-semibold text-foreground" data-nexen-id="nx-634b294b-3">{name}</p>
            <p className="break-all text-sm text-muted-foreground" data-nexen-id="nx-634b294b-4">{contact}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end sm:gap-4">
          <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`} data-nexen-id="nx-634b294b-5">
            {status.label}
          </span>
          <div className="text-right">
            <p className="text-xs text-muted-foreground" data-nexen-id="nx-634b294b-6">Monthly fee</p>
            <p className="text-base font-semibold text-foreground" data-nexen-id="nx-634b294b-7">{formatFee(student.monthlyFee)}</p>
          </div>
        </div>
      </Link>
    </li>
  );
}