'use client';

import Link from 'next/link';
import type { Student } from '@/types/student';

type CheckListStudent = Pick<Student, 'id' | 'name' | 'monthlyFee'>;

interface StudentCheckListProps {
  students: CheckListStudent[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

function formatFee(value: unknown): string {
  const amount = Number(value);
  return `₹${(Number.isFinite(amount) ? amount : 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function StudentCheckList({ students, selectedIds, onChange }: StudentCheckListProps) {
  const safeStudents = Array.isArray(students) ? students : [];
  const safeSelected = Array.isArray(selectedIds) ? selectedIds : [];
  const selectedSet = new Set(safeSelected);

  const total = safeStudents.length;
  const selectedCount = safeStudents.filter((s) => selectedSet.has(s.id)).length;
  const allSelected = total > 0 && selectedCount === total;

  function toggleAll() {
    onChange(allSelected ? [] : safeStudents.map((s) => s.id));
  }

  function toggleOne(id: string) {
    if (selectedSet.has(id)) {
      onChange(safeSelected.filter((existing) => existing !== id));
    } else {
      onChange([...safeSelected, id]);
    }
  }

  if (total === 0) {
    return (
      <div className="rounded-[var(--radius)] border border-border bg-card p-6 text-center shadow-sm">
        <p className="text-sm text-muted-foreground" data-nexen-id="nx-be5eea7f-0">
          You have no students yet. Add a student before generating invoices.
        </p>
        <Link
          href="/students/new"
          className="mt-4 inline-flex items-center rounded-[var(--radius)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
         data-nexen-id="nx-be5eea7f-1">
          Add a student
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 rounded-[var(--radius)] border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-foreground" data-nexen-id="nx-be5eea7f-2">
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer accent-[hsl(var(--primary))]"
            checked={allSelected}
            onChange={toggleAll}
            aria-label="Select all students"
           data-nexen-id="nx-be5eea7f-3"/>
          Select all
        </label>
        <span className="text-sm text-muted-foreground" data-nexen-id="nx-be5eea7f-4">
          {selectedCount} of {total} selected
        </span>
      </div>

      <ul className="divide-y divide-border" data-nexen-id="nx-be5eea7f-5">
        {safeStudents.map((student) => {
          const checked = selectedSet.has(student.id);
          return (
            <li data-nexen-component="nx_components_StudentCheckList" key={student.id} data-nexen-id="nx-be5eea7f-6">
              <label className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-primary/5" data-nexen-id="nx-be5eea7f-7">
                <input
                  type="checkbox"
                  className="h-4 w-4 shrink-0 cursor-pointer accent-[hsl(var(--primary))]"
                  checked={checked}
                  onChange={() => toggleOne(student.id)}
                 data-nexen-id="nx-be5eea7f-8"/>
                <span className="min-w-0 flex-1 truncate text-sm text-foreground" data-nexen-id="nx-be5eea7f-9">
                  {student.name}
                </span>
                <span className="shrink-0 text-sm text-muted-foreground" data-nexen-id="nx-be5eea7f-10">
                  {formatFee(student.monthlyFee)}/mo
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}