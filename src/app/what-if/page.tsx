
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import PageHeader from '@/components/PageHeader';
import StudentPicker from '@/components/StudentPicker';
import WhatIfImpactPanel from '@/components/WhatIfImpactPanel';
import { getStudents } from '@/lib/api';
import type { Student } from '@/types/student';

export default function WhatIfPage() {
  const [studentId, setStudentId] = useState('');
  const [analysedId, setAnalysedId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    let active = true;
    getStudents()
      .then((list) => {
        if (active) setStudents(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const studentName =
    students.find((s) => s.id === analysedId)?.name ?? '';

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!studentId) {
      setFormError('Please choose a student to run the what-if analysis.');
      setAnalysedId(null);
      return;
    }
    setFormError(null);
    setAnalysedId(studentId);
  }

  return (
    <main data-nexen-component="nx_app_what_if_page" className="mx-auto w-full max-w-3xl min-w-0 space-y-6 px-4 py-6" data-nexen-id="nx-bbe28cc2-0">
      <PageHeader
        title="What if a student pays 15 days late?"
        subtitle="Choose a student to see how a 15-day delay changes the forecast and their invoices."
        actions={null}
        className=""
      />

      <form
        onSubmit={handleSubmit}
        className="w-full space-y-4 rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm"
       data-nexen-id="nx-bbe28cc2-1">
        <StudentPicker
          value={studentId}
          onChange={setStudentId}
          label="Student"
          disabled={false}
        />
        {formError ? (
          <p role="alert" className="text-sm text-destructive" data-nexen-id="nx-bbe28cc2-2">
            {formError}
          </p>
        ) : null}
        <button
          type="submit"
          className="min-h-11 w-full rounded-[var(--radius)] bg-primary px-4 text-sm font-medium text-primary-foreground sm:w-auto"
         data-nexen-id="nx-bbe28cc2-3">
          Run what-if analysis
        </button>
      </form>

      <WhatIfImpactPanel studentId={analysedId} studentName={studentName} />
    </main>
  );
}