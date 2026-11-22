'use client';

import { useEffect, useId, useState } from 'react';
import { getStudents } from '@/lib/api';
import type { Student } from '@/types/student';

type StudentPickerProps = {
  value?: string;
  onChange?: (studentId: string) => void;
  label?: string;
  disabled?: boolean;
};

export default function StudentPicker(props: StudentPickerProps) {
  const { value = '', onChange, label = 'Student', disabled = false } = props;
  const selectId = useId();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getStudents()
      .then((rows) => {
        if (cancelled) return;
        const list = Array.isArray(rows) ? rows : [];
        const sorted = [...list].sort((a, b) =>
          (a.name ?? '').localeCompare(b.name ?? ''),
        );
        setStudents(sorted);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : 'Could not load students.',
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const safeStudents = Array.isArray(students) ? students : [];
  const hasStudents = safeStudents.length > 0;

  return (
    <div data-nexen-component="nx_components_StudentPicker" className="flex w-full min-w-0 flex-col gap-2">
      <label
        htmlFor={selectId}
        className="text-sm font-medium text-foreground"
       data-nexen-id="nx-5245e052-0">
        {label}
      </label>

      {isLoading ? (
        <p className="text-sm text-muted-foreground" data-nexen-id="nx-5245e052-1">Loading students…</p>
      ) : error ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0 text-sm text-destructive" data-nexen-id="nx-5245e052-2">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="w-full rounded-[var(--radius)] border border-border px-3 py-2 text-sm text-foreground sm:w-auto"
           data-nexen-id="nx-5245e052-3">
            Try again
          </button>
        </div>
      ) : !hasStudents ? (
        <p className="text-sm text-muted-foreground" data-nexen-id="nx-5245e052-4">No students yet.</p>
      ) : (
        <select
          id={selectId}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full min-w-0 max-w-full rounded-[var(--radius)] border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
         data-nexen-id="nx-5245e052-5">
          <option value="">Choose a student</option>
          {safeStudents.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}