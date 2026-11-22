import Link from 'next/link';

export interface OwingStudent {
  student_id: string;
  name: string;
  amount_owed: number | string;
  days_overdue: number;
  due_in_days?: number;
}

interface OwingStudentsListProps {
  students?: OwingStudent[] | null;
}

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

function formatAmount(value: number | string): string {
  const n = Number(value);
  return currency.format(Number.isFinite(n) ? n : 0);
}

function overdueLabel(days: number): string {
  if (!Number.isFinite(days) || days <= 0) return 'Due now';
  return days === 1 ? '1 day overdue' : `${days} days overdue`;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return (first + last).toUpperCase();
}

export default function OwingStudentsList({ students }: OwingStudentsListProps) {
  const safeStudents = Array.isArray(students) ? students : [];

  if (safeStudents.length === 0) {
    return (
      <div className="w-full rounded-[var(--radius)] border border-border bg-card p-6 text-center shadow-sm">
        <p className="text-sm font-medium text-foreground" data-nexen-id="nx-18cf89ee-0">Nobody owes money right now.</p>
        <p className="mt-1 text-sm text-muted-foreground" data-nexen-id="nx-18cf89ee-1">
          Students with overdue invoices will appear here.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex w-full flex-col gap-3" data-nexen-id="nx-18cf89ee-2">
      {safeStudents.map((student, index) => {
        const rowKey = student.student_id ? String(student.student_id) : `${student.name || 'student'}-${index}`;
        const days = Number(student.days_overdue);
        const dueIn = Number.isFinite(Number(student.due_in_days)) ? Number(student.due_in_days) : 0;
        const isOverdue = Number.isFinite(days) && days > 0;

        return (
          <li data-nexen-component="nx_components_OwingStudentsList" key={rowKey} data-nexen-id="nx-18cf89ee-3">
            <Link
              href={`/students/${student.student_id}`}
              className="flex w-full flex-col gap-3 rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm transition-colors hover:bg-primary/5 sm:flex-row sm:items-center sm:justify-between"
             data-nexen-id="nx-18cf89ee-4">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground"
                 data-nexen-id="nx-18cf89ee-5">
                  {initialsOf(student.name)}
                </span>
                <span className="truncate text-sm font-medium text-foreground" data-nexen-id="nx-18cf89ee-6">{student.name}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:shrink-0">
                <span className="text-base font-semibold text-foreground" data-nexen-id="nx-18cf89ee-7">
                  {formatAmount(student.amount_owed)}
                </span>
                <span
                  className={
                    isOverdue
                      ? 'inline-flex whitespace-nowrap rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive'
                      : 'inline-flex whitespace-nowrap rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'
                  }
                 data-nexen-id="nx-18cf89ee-8">
                  {days > 0 ? overdueLabel(days) : dueIn > 0 ? (dueIn === 1 ? 'Due in 1 day' : `Due in ${dueIn} days`) : 'Due now'}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}