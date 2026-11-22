import type { ReactNode } from 'react';

export type ForecastPeriod = {
  days: number;
  cashIn: number | string;
  cashOut: number | string;
};

type ForecastCardsProps = {
  periods?: ForecastPeriod[] | null;
};

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

function toAmount(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(value: number): string {
  return currency.format(value);
}

function EmptyForecast(): ReactNode {
  return (
    <div
      role="status"
      className="rounded-[var(--radius)] border border-dashed border-border bg-card p-6 text-center"
    >
      <p className="text-sm font-medium text-foreground" data-nexen-id="nx-4dbc98cd-0">No forecast figures yet</p>
      <p className="mt-1 text-sm text-muted-foreground" data-nexen-id="nx-4dbc98cd-1">
        Add unpaid invoices or bills to see your 30, 60 and 90-day cash flow.
      </p>
    </div>
  );
}

export default function ForecastCards({ periods }: ForecastCardsProps) {
  const safePeriods = Array.isArray(periods) ? periods : [];

  if (safePeriods.length === 0) {
    return <EmptyForecast />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {safePeriods.map((period, index) => {
        const days = toAmount(period.days);
        const cashIn = toAmount(period.cashIn);
        const cashOut = toAmount(period.cashOut);
        const net = cashIn - cashOut;
        const netIsNegative = net < 0;

        const rows = [
          {
            key: 'in',
            label: 'Expected cash in',
            value: cashIn,
            className: 'text-foreground',
          },
          {
            key: 'out',
            label: 'Expected cash out',
            value: cashOut,
            className: 'text-foreground',
          },
          {
            key: 'net',
            label: 'Net cash flow',
            value: net,
            className: netIsNegative ? 'text-destructive' : 'text-primary',
          },
        ];

        return (
          <section data-nexen-component="nx_components_ForecastCards"
            key={`${days}-${index}`}
            aria-label={`${days} day forecast`}
            className="min-w-0 rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm"
           data-nexen-id="nx-4dbc98cd-2">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="min-w-0 text-base font-semibold text-foreground" data-nexen-id="nx-4dbc98cd-3">
                {days} days
              </h3>
              <span className="shrink-0 text-xs text-muted-foreground" data-nexen-id="nx-4dbc98cd-4">
                Next {days} days
              </span>
            </div>

            <dl className="mt-4 space-y-3 text-sm" data-nexen-id="nx-4dbc98cd-5">
              {rows.map((row) => (
                <div
                  key={row.key}
                  className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                >
                  <dt className="min-w-0 text-muted-foreground" data-nexen-id="nx-4dbc98cd-6">{row.label}</dt>
                  <dd
                    className={`font-medium tabular-nums break-words ${row.className}`}
                   data-nexen-id="nx-4dbc98cd-7">
                    {formatMoney(row.value)}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground" data-nexen-id="nx-4dbc98cd-8">
              {netIsNegative
                ? 'Cash out is higher than cash in for this period.'
                : 'Cash in covers cash out for this period.'}
            </p>
          </section>
        );
      })}
    </div>
  );
}