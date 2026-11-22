export interface ForecastBreakdownRow {
  days: number;
  cashIn: number | string;
  cashOut: number | string;
}

export interface ForecastBreakdownTableProps {
  periods?: ForecastBreakdownRow[] | null;
}

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});

function toAmount(value: number | string | null | undefined): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function ForecastBreakdownTable({
  periods,
}: ForecastBreakdownTableProps) {
  const safePeriods = Array.isArray(periods) ? periods : [];

  if (safePeriods.length === 0) {
    return (
      <div className="rounded-[var(--radius)] border bg-card p-6 text-center shadow-sm">
        <p className="text-sm font-medium text-foreground" data-nexen-id="nx-c427378c-0">
          No forecast figures yet
        </p>
        <p className="mt-1 text-sm text-muted-foreground" data-nexen-id="nx-c427378c-1">
          Add unpaid invoices or bills to see the 30, 60 and 90-day outlook.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-[var(--radius)] border bg-card shadow-sm">
      <table className="w-full border-collapse text-sm" data-nexen-id="nx-c427378c-2">
        <thead data-nexen-id="nx-c427378c-3">
          <tr className="border-b text-left text-muted-foreground" data-nexen-id="nx-c427378c-4">
            <th scope="col" className="whitespace-nowrap px-4 py-3 font-medium" data-nexen-id="nx-c427378c-5">
              Period
            </th>
            <th
              scope="col"
              className="whitespace-nowrap px-4 py-3 text-right font-medium"
             data-nexen-id="nx-c427378c-6">
              Expected cash in
            </th>
            <th
              scope="col"
              className="whitespace-nowrap px-4 py-3 text-right font-medium"
             data-nexen-id="nx-c427378c-7">
              Expected cash out
            </th>
            <th
              scope="col"
              className="whitespace-nowrap px-4 py-3 text-right font-medium"
             data-nexen-id="nx-c427378c-8">
              Net
            </th>
          </tr>
        </thead>
        <tbody data-nexen-id="nx-c427378c-9">
          {safePeriods.map((row) => {
            const cashIn = toAmount(row.cashIn);
            const cashOut = toAmount(row.cashOut);
            const net = cashIn - cashOut;
            const netClass = net < 0 ? 'text-destructive' : 'text-primary';

            return (
              <tr data-nexen-component="nx_components_ForecastBreakdownTable" key={row.days} className="border-b last:border-b-0" data-nexen-id="nx-c427378c-10">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground" data-nexen-id="nx-c427378c-11">
                  {`${row.days} days`}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-foreground" data-nexen-id="nx-c427378c-12">
                  {currency.format(cashIn)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-foreground" data-nexen-id="nx-c427378c-13">
                  {currency.format(cashOut)}
                </td>
                <td
                  className={`whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums ${netClass}`}
                 data-nexen-id="nx-c427378c-14">
                  {currency.format(net)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}