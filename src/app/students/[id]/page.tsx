
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ApiError, deleteStudent, getStudentById, updateStudent } from '@/lib/api';
import type { Student } from '@/types/student';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import PageHeader from '@/components/PageHeader';
import StudentForm from '@/components/StudentForm';

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const studentId = params.id;
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getStudentById(studentId)
      .then((data) => {
        if (!cancelled) setStudent(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setLoadError(e instanceof ApiError ? e.message : 'Could not load this student.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  if (isLoading) {
    return <p className="p-4 text-sm text-muted-foreground sm:p-6" data-nexen-id="nx-36e53596-0">Loading student…</p>;
  }

  if (loadError || !student) {
    return (
      <main className="mx-auto w-full max-w-3xl space-y-4 p-4 sm:p-6" data-nexen-id="nx-36e53596-1">
        <Link href="/students" className="inline-flex min-h-11 items-center text-sm text-muted-foreground hover:text-foreground" data-nexen-id="nx-36e53596-2">
          ← Back to students
        </Link>
        <p className="text-sm text-destructive" data-nexen-id="nx-36e53596-3">{loadError ?? 'This student could not be found.'}</p>
      </main>
    );
  }

  const initialValues = {
    name: student.name,
    email: student.email ?? '',
    phone: student.phone ?? '',
    startDate: student.startDate,
    status: student.status,
    guardian: student.guardian ?? '',
  };

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteStudent(studentId);
      router.push('/students');
    } catch (e) {
      setDeleteError(
        e instanceof ApiError
          ? `${e.message} If this student has unpaid or overdue invoices, set the status to former instead.`
          : 'Could not delete this student. Please try again.',
      );
      setDeleting(false);
    }
  }

  return (
    <main data-nexen-component="nx_app_students__id__page" className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-6" data-nexen-id="nx-36e53596-4">
      <Link href="/students" className="inline-flex min-h-11 items-center text-sm text-muted-foreground hover:text-foreground" data-nexen-id="nx-36e53596-5">
        ← Back to students
      </Link>

      <PageHeader
        title={student.name}
        subtitle="View and update this student's information."
        actions={
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="min-h-11 rounded-[var(--radius)] border border-border px-4 text-sm font-medium text-destructive hover:bg-card"
           data-nexen-id="nx-36e53596-6">
            Delete student
          </button>
        }
        className="w-full"
      />

      {savedMessage && (
        <p role="status" className="rounded-[var(--radius)] border border-border bg-card p-3 text-sm text-primary" data-nexen-id="nx-36e53596-7">
          {savedMessage}
        </p>
      )}

      <section className="min-w-0 rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm sm:p-6" data-nexen-id="nx-36e53596-8">
        <StudentForm
          initialValues={initialValues}
          submitLabel="Save changes"
          submitting={saving}
          onSubmit={async (values) => {
            setSaving(true);
            setSaveError(null);
            setSavedMessage(null);
            try {
              const updated = await updateStudent(studentId, values);
              setStudent(updated);
              setSavedMessage('Changes saved.');
            } catch (e) {
              setSaveError(e instanceof ApiError ? e.message : 'Could not save changes. Please try again.');
            } finally {
              setSaving(false);
            }
          }}
          onCancel={() => router.push('/students')}
        />
        {saveError && <p className="mt-4 text-sm text-destructive" data-nexen-id="nx-36e53596-9">{saveError}</p>}
      </section>

      <ConfirmDeleteDialog
        open={confirmOpen}
        title="Delete this student?"
        message="This permanently removes the student. Students with unpaid or overdue invoices cannot be deleted."
        confirmLabel="Delete student"
        cancelLabel="Cancel"
        isDeleting={deleting}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </main>
  );
}