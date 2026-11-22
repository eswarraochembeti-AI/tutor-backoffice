'use client';

import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import StudentSearchBar from '@/components/StudentSearchBar';
import { useStudentSearch } from '@/hooks/useStudentSearch';

export default function StudentsPage() {
  const { students, query, setQuery, queryError, isLoading, error, refetch } =
    useStudentSearch();

  const list = Array.isArray(students) ? students : [];
  const needle = (query ?? '').trim().toLowerCase();
  const visible = list
    .filter((s) => s.name.toLowerCase().includes(needle))
    .sort((a, b) => a.name.localeCompare(b.name));
  const count = visible.length;

  const addButton = (
    <Link
      href="/students/new"
      className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius)] bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm"
     data-nexen-id="nx-41223b99-0">
      Add student
    </Link>
  );

  return (
    <div data-nexen-component="nx_app_students_page" className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      <PageHeader
        title="Students"
        subtitle="Find and manage each student you tutor."
        actions={addButton}
        className=""
      />

      <StudentSearchBar
        value={query ?? ''}
        onChange={setQuery}
        error={queryError ?? null}
      />

      {!isLoading && !error && list.length > 0 && (
        <p className="text-sm text-muted-foreground" aria-live="polite" data-nexen-id="nx-41223b99-1">
          {`Showing ${count} ${count === 1 ? 'student' : 'students'}`}
        </p>
      )}

      {isLoading && (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 w-full animate-pulse rounded-[var(--radius)] border border-border bg-card"
            />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="flex flex-col items-start gap-3 rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm">
          <p className="font-medium text-foreground" data-nexen-id="nx-41223b99-2">Students could not be loaded</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius)] border border-border px-4 text-sm font-medium text-foreground"
           data-nexen-id="nx-41223b99-3">
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && list.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius)] border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-base font-semibold text-foreground" data-nexen-id="nx-41223b99-4">No students yet</p>
          <p className="text-sm text-muted-foreground" data-nexen-id="nx-41223b99-5">
            Add your first student to start raising invoices.
          </p>
          {addButton}
        </div>
      )}

      {!isLoading && !error && list.length > 0 && visible.length === 0 && (
        <p className="rounded-[var(--radius)] border border-border bg-card p-6 text-center text-sm text-muted-foreground" data-nexen-id="nx-41223b99-6">
          No students match your search
        </p>
      )}

      {!isLoading && !error && visible.length > 0 && (
        <>
          <ul className="space-y-3 sm:hidden" data-nexen-id="nx-41223b99-7">
            {visible.map((s) => (
              <li key={s.id} className="min-w-0" data-nexen-id="nx-41223b99-8">
                <Link
                  href={`/students/${s.id}`}
                  className="block min-w-0 rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm"
                 data-nexen-id="nx-41223b99-9">
                  <p className="truncate font-semibold text-foreground" data-nexen-id="nx-41223b99-10">{s.name}</p>
                  <p className="mt-1 truncate text-sm text-muted-foreground" data-nexen-id="nx-41223b99-11">
                    {[s.email, s.phone].filter(Boolean).join(' · ') || '—'}
                  </p>
                  <p className="mt-2 text-sm text-foreground" data-nexen-id="nx-41223b99-12">
                    Monthly fee ₹{Number(s.monthlyFee).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto rounded-[var(--radius)] border border-border bg-card shadow-sm sm:block">
            <table className="w-full text-left text-sm" data-nexen-id="nx-41223b99-13">
              <thead data-nexen-id="nx-41223b99-14">
                <tr className="border-b border-border text-muted-foreground" data-nexen-id="nx-41223b99-15">
                  <th className="px-4 py-3 font-medium" data-nexen-id="nx-41223b99-16">Name</th>
                  <th className="px-4 py-3 font-medium" data-nexen-id="nx-41223b99-17">Contact</th>
                  <th className="px-4 py-3 font-medium" data-nexen-id="nx-41223b99-18">Monthly fee</th>
                </tr>
              </thead>
              <tbody data-nexen-id="nx-41223b99-19">
                {visible.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-b-0 hover:bg-primary/10" data-nexen-id="nx-41223b99-20">
                    <td className="px-4 py-3" data-nexen-id="nx-41223b99-21">
                      <Link
                        href={`/students/${s.id}`}
                        className="block min-h-[44px] font-medium text-foreground"
                       data-nexen-id="nx-41223b99-22">
                        {s.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground" data-nexen-id="nx-41223b99-23">
                      {[s.email, s.phone].filter(Boolean).join(' · ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-foreground" data-nexen-id="nx-41223b99-24">
                      ₹{Number(s.monthlyFee).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}