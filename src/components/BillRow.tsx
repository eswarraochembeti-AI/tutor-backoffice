import Link from 'next/link';
import type { Bill } from '@/types/bill';

type BillRowProps = {
  bill: Bill;
};

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

function formatAmount(value: unknown): string {
  const n = Number(value);
  return `₹${(Number.isFinite(n) ? n : 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value: unknown): string {
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}

const PAID_BADGE = 'bg-primary/10 text-primary';
const UNPAID_BADGE = 'bg-accent/15 text-accent';

export default function BillRow({ bill }: BillRowProps) {
  const isPaid = bill.status === 'paid';
  const title = bill.title?.trim() || 'Untitled bill';

  return (
    <Link
      href={`/bills/${bill.id}`}
      className="block min-w-0 rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
     data-nexen-id="nx-623cb641-0">
      <div data-nexen-component="nx_components_BillRow" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground" data-nexen-id="nx-623cb641-1">{title}</p>
          <p className="text-sm text-muted-foreground" data-nexen-id="nx-623cb641-2">
            Due {formatDate(bill.dueDate)}
          </p>
          {bill.details ? (
            <p className="mt-1 truncate text-sm text-muted-foreground" data-nexen-id="nx-623cb641-3">
              {bill.details}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="font-mono text-base font-semibold text-foreground" data-nexen-id="nx-623cb641-4">
            {formatAmount(bill.amount)}
          </span>
          <span
            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isPaid ? PAID_BADGE : UNPAID_BADGE
            }`}
           data-nexen-id="nx-623cb641-5">
            {isPaid ? 'Paid' : 'Unpaid'}
          </span>
        </div>
      </div>
    </Link>
  );
}