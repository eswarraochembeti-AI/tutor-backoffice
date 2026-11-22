import Link from 'next/link';

export interface AlertCardProps {
  invoiceId: string;
  message: string;
  studentName: string;
  invoiceRef: string;
  amountOwed: number | string;
  daysOverdue: number;
}

export function AlertCard(props: AlertCardProps) {
  const { invoiceId, message, studentName, invoiceRef, amountOwed, daysOverdue } = props;

  const owed = Number(amountOwed);
  const amountLabel = `₹${(Number.isFinite(owed) ? owed : 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const days = Number.isFinite(daysOverdue) ? Math.max(0, Math.floor(daysOverdue)) : 0;
  const overdueLabel =
    days === 0 ? 'Due today' : `${days} ${days === 1 ? 'day' : 'days'} overdue`;

  const href = `/invoices/${invoiceId}`;
  const ariaLabel = `${message}: ${studentName}, invoice ${invoiceRef}, ${amountLabel} owed, ${overdueLabel}. Open invoice.`;

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="block w-full min-w-0 rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
     data-nexen-id="nx-0596b548-0">
      <div data-nexen-component="nx_components_AlertCard" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <span className="inline-flex max-w-full rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive" data-nexen-id="nx-0596b548-1">
            <span className="truncate" data-nexen-id="nx-0596b548-2">{message}</span>
          </span>

          <p className="mt-2 truncate text-base font-semibold text-foreground" data-nexen-id="nx-0596b548-3">
            {studentName}
          </p>

          <p className="mt-1 break-all font-mono text-xs text-muted-foreground" data-nexen-id="nx-0596b548-4">
            {invoiceRef}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
          <div className="text-left sm:text-right">
            <p className="text-lg font-bold text-foreground" data-nexen-id="nx-0596b548-5">{amountLabel}</p>
            <p
              className={
                days > 0
                  ? 'text-xs font-medium text-destructive'
                  : 'text-xs text-muted-foreground'
              }
             data-nexen-id="nx-0596b548-6">
              {overdueLabel}
            </p>
          </div>

          <span aria-hidden="true" className="shrink-0 text-sm font-medium text-primary" data-nexen-id="nx-0596b548-7">
            Open invoice →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default AlertCard;