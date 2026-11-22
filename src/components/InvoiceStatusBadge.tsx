import type { ReactNode } from 'react';

export type InvoiceBadgeStatus = 'paid' | 'unpaid' | 'overdue';

interface InvoiceStatusBadgeProps {
  status?: string | null;
  className?: string;
}

const STYLES: Record<InvoiceBadgeStatus, { label: string; classes: string }> = {
  paid: {
    label: 'Paid',
    classes: 'bg-primary/10 text-primary border-primary/30',
  },
  unpaid: {
    label: 'Unpaid',
    classes: 'bg-accent/15 text-accent border-accent/30',
  },
  overdue: {
    label: 'Overdue',
    classes: 'bg-destructive/10 text-destructive border-destructive/30',
  },
};

function normaliseStatus(status: string | null | undefined): InvoiceBadgeStatus {
  const value = typeof status === 'string' ? status.trim().toLowerCase() : '';
  if (value === 'paid') return 'paid';
  if (value === 'overdue') return 'overdue';
  // 'unpaid', 'issued' and any unknown value are treated as unpaid
  return 'unpaid';
}

export default function InvoiceStatusBadge({
  status,
  className = '',
}: InvoiceStatusBadgeProps): ReactNode {
  const key = normaliseStatus(status);
  const { label, classes } = STYLES[key];

  return (
    <span data-nexen-component="nx_components_InvoiceStatusBadge"
      role="status"
      aria-label={`Invoice status: ${label}`}
      className={[
        'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium',
        classes,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
     data-nexen-id="nx-09509215-0">
      {label}
    </span>
  );
}