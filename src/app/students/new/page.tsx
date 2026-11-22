'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import StudentForm from '@/components/StudentForm';
import { ApiError, createStudent } from '@/lib/api';

export default function NewStudentPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  return (
    <div data-nexen-component="nx_app_students_new_page" className="mx-auto w-full max-w-2xl min-w-0 space-y-6 px-4 py-6 font-sans">
      <PageHeader
        title="Add student"
        subtitle="Enter the student's details and monthly fee. New students start as active."
        actions={null}
        className=""
      />

      {serverError && (
        <p
          role="alert"
          className="rounded-[var(--radius)] border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
         data-nexen-id="nx-ce8819c1-0">
          {serverError}
        </p>
      )}

      <div className="rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm sm:p-6">
        <StudentForm
          initialValues={{ status: 'active' }}
          submitLabel="Save student"
          submitting={submitting}
          onCancel={() => router.push('/students')}
          onSubmit={async (values) => {
            setServerError(null);

            if (!values.email?.trim() && !values.phone?.trim()) {
              setServerError(
                'Please add an email address or phone number so you can chase late payments.',
              );
              return;
            }

            setSubmitting(true);
            try {
              const student = await createStudent({ ...values, status: 'active' });
              router.push(`/students/${student.id}`);
            } catch (err) {
              setServerError(
                err instanceof ApiError
                  ? err.message
                  : 'Could not save the student. Please try again.',
              );
            } finally {
              setSubmitting(false);
            }
          }}
        />
      </div>
    </div>
  );
}