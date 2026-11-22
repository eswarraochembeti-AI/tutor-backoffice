import Link from 'next/link';

type OwedSummaryCardProps = {
  totalOutstanding?: number;
  owingCount?: number;
};

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

export default function OwedSummaryCard(props: OwedSummaryCardProps) {
  const total = Number.isFinite(props.totalOutstanding)
    ? Number(props.totalOutstanding)
    : 0;
  const count = Number.isFinite(props.owingCount)
    ? Number(props.owingCount)
    : 0;
  const hasOwed = total > 0 && count > 0;

  return (
    <section data-nexen-component="nx_components_OwedSummaryCard"
      aria-labelledby="owed-summary-heading"
      className="w-full min-w-0 rounded-[var(--radius)] border bg-card p-6 text-card-foreground shadow-sm"
     data-nexen-id="nx-fc97ba47-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h2
            id="owed-summary-heading"
            className="text-lg font-semibold text-foreground"
           data-nexen-id="nx-fc97ba47-1">
            Who owes money
          </h2>
          <p className="mt-1 text-sm text-muted-foreground" data-nexen-id="nx-fc97ba47-2">
            Total outstanding across all unpaid invoices
          </p>
        </div>

        {hasOwed && (
          <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive" data-nexen-id="nx-fc97ba47-3">
            {count} {count === 1 ? 'student' : 'students'} owing
          </span>
        )}
      </div>

      {hasOwed ? (
        <div className="mt-6 min-w-0">
          <p className="text-3xl font-bold tracking-tight text-foreground break-words" data-nexen-id="nx-fc97ba47-4">
            {currency.format(total)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground" data-nexen-id="nx-fc97ba47-5">
            Chase the oldest overdue invoices first.
          </p>
        </div>
      ) : (
        <div
          role="status"
          className="mt-6 rounded-[var(--radius)] border border-dashed p-4 text-center"
        >
          <p className="text-sm font-medium text-foreground" data-nexen-id="nx-fc97ba47-6">
            Nobody owes money right now.
          </p>
          <p className="mt-1 text-sm text-muted-foreground" data-nexen-id="nx-fc97ba47-7">
            New overdue payments will appear here.
          </p>
        </div>
      )}

      <div className="mt-6 border-t pt-4">
        <Link
          href="/invoices"
          className="inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
         data-nexen-id="nx-fc97ba47-8">
          View all invoices
        </Link>
      </div>
    </section>
  );
}