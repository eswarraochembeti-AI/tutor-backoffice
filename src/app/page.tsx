'use client';

import { useCallback, useEffect, useState } from 'react';
import { getDashboard } from '@/lib/api';
import FeatureLinks from '@/components/FeatureLinks';
import OwedSummaryCard from '@/components/OwedSummaryCard';
import OwingStudentsList from '@/components/OwingStudentsList';
import PageHeader from '@/components/PageHeader';

type DashboardData = Awaited<ReturnType<typeof getDashboard>>;

export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getDashboard();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The list could not load.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const students = data && Array.isArray(data.students) ? data.students : [];
  const totalOutstanding = Number(data?.total_outstanding ?? 0);
  const showContent = !isLoading && !error;

  return (
    <main data-nexen-component="nx_app_page" className="mx-auto w-full max-w-3xl min-w-0 space-y-6 p-4 sm:p-6" data-nexen-id="nx-3393394e-0">
      <PageHeader
        title="TutorLedger"
        subtitle="A simple tool for a home tutor to manage student fees, raise monthly invoices, track overdue payments and forecast cash flow."
        actions={null}
        className=""
      />

      <section className="min-w-0 space-y-3" data-nexen-id="nx-3393394e-1">
        <h2 className="text-lg font-semibold text-foreground" data-nexen-id="nx-3393394e-2">Who owes money</h2>

        {isLoading && (
          <p role="status" className="rounded-[var(--radius)] border bg-card p-4 text-sm text-muted-foreground" data-nexen-id="nx-3393394e-3">
            Loading students who owe money…
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-[var(--radius)] border border-destructive/40 bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="min-w-0 text-sm text-destructive" data-nexen-id="nx-3393394e-4">
              The list could not load. {error}
            </p>
            <button
              type="button"
              onClick={() => void load()}
              className="min-h-11 rounded-[var(--radius)] border bg-background px-4 py-2 text-sm font-medium text-foreground"
             data-nexen-id="nx-3393394e-5">
              Try again
            </button>
          </div>
        )}

        {showContent && (
          <>
            <OwedSummaryCard totalOutstanding={totalOutstanding} owingCount={students.length} />
            <OwingStudentsList students={students} />
          </>
        )}
      </section>

      <section className="min-w-0 space-y-3" data-nexen-id="nx-3393394e-6">
        <h2 className="text-lg font-semibold text-foreground" data-nexen-id="nx-3393394e-7">Go to</h2>
        <FeatureLinks />
      </section>
    </main>
  );
}