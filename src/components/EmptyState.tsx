
import Link from 'next/link';
import type { ReactNode } from 'react';

export interface EmptyStateAction {
  label: string;
  href: string;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: EmptyStateAction;
  className?: string;
}

export default function EmptyState(props: EmptyStateProps) {
  const { title, description, icon, action, className = '' } = props;

  return (
    <div data-nexen-component="nx_components_EmptyState"
      role="status"
      className={`w-full min-w-0 rounded-[var(--radius)] border border-border bg-card px-4 py-8 text-center shadow-sm sm:px-8 sm:py-12 ${className}`.trim()}
    >
      {icon ? (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius)] bg-primary/10 text-primary [&_svg]:h-6 [&_svg]:w-6">
          {icon}
        </div>
      ) : null}

      <h3 className="break-words text-base font-semibold text-foreground" data-nexen-id="nx-d69f50f7-0">{title}</h3>

      {description ? (
        <p className="mx-auto mt-2 max-w-md break-words text-sm text-muted-foreground" data-nexen-id="nx-d69f50f7-1">
          {description}
        </p>
      ) : null}

      {action ? (
        <div className="mt-6 flex justify-center">
          <Link
            href={action.href}
            className="inline-flex items-center justify-center rounded-[var(--radius)] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
           data-nexen-id="nx-d69f50f7-2">
            {action.label}
          </Link>
        </div>
      ) : null}
    </div>
  );
}