
'use client';

import { useCallback, useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import ForecastCards from '@/components/ForecastCards';
import ForecastBreakdownTable from '@/components/ForecastBreakdownTable';
import { getCashFlowForecast } from '@/lib/api';

type ForecastWindow = { cash_in: number; cash_out: number; net: number };
type ForecastResponse = {
  days_30: ForecastWindow;
  days_60: ForecastWindow;
  days_90: ForecastWindow;
};
type PeriodFigures = {
  label: string;
  days: number;
  cashIn: number;
  cashOut: number;
  net: number;
};

function toPeriods(d: ForecastResponse): PeriodFigures[] {
  return [
    { label: '30 days', days: 30, cashIn: d.days_30.cash_in, cashOut: d.days_30.cash_out, net: d.days_30.net },
    { label: '60 days', days: 60, cashIn: d.days_60.cash_in, cashOut: d.days_60.cash_out, net: d.days_60.net },
    { label: '90 days', days: 90, cashIn: d.days_90.cash_in, cashOut: d.days_90.cash_out, net: d.days_90.net },
  ];
}

export default function CashFlowForecastPage() {
  const [periods, setPeriods] = useState<PeriodFigures[] | null>(null);
  const [calculatedOn, setCalculatedOn] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data: ForecastResponse = await getCashFlowForecast();
      setPeriods(toPeriods(data));
      setCalculatedOn(
        new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      );
    } catch {
      setPeriods(null);
      setError('Forecast could not be calculated. Try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const safePeriods = Array.isArray(periods) ? periods : null;
  const nothingDue =
    safePeriods !== null &&
    safePeriods.every((p) => p.cashIn === 0 && p.cashOut === 0);

  return (
    <div data-nexen-component="nx_app_cash_flow_forecast_page" className="mx-auto w-full max-w-5xl min-w-0 space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Cash Flow Forecast"
        subtitle="Based on your unpaid invoices and bills."
        actions={null}
        className=""
      />

      {isLoading && (
        <div className="space-y-6" aria-busy="true">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-32 w-full animate-pulse rounded-[var(--radius)] border bg-card"
              />
            ))}
          </div>
          <div className="h-40 w-full animate-pulse rounded-[var(--radius)] border bg-card" />
        </div>
      )}

      {!isLoading && error && (
        <div role="alert" className="space-y-3 rounded-[var(--radius)] border bg-card p-4">
          <p className="text-sm text-destructive" data-nexen-id="nx-f9f3e3d4-0">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="min-h-11 rounded-[var(--radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
           data-nexen-id="nx-f9f3e3d4-1">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && safePeriods && (
        <>
          {nothingDue && (
            <p className="text-sm text-muted-foreground" data-nexen-id="nx-f9f3e3d4-2">Nothing due in this period</p>
          )}
          <ForecastCards periods={safePeriods} />
          <div className="min-w-0 overflow-x-auto rounded-[var(--radius)] border bg-card">
            <ForecastBreakdownTable periods={safePeriods} />
          </div>
          <p className="text-sm text-muted-foreground" data-nexen-id="nx-f9f3e3d4-3">
            Cash in comes from unpaid invoices and cash out comes from bills. Calculated on{' '}
            {calculatedOn}.
          </p>
        </>
      )}
    </div>
  );
}