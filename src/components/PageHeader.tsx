import type { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, className = '' }: PageHeaderProps) {
  return (
    <header data-nexen-component="nx_components_PageHeader"
      className={`flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-6 ${className}`.trim()}
     data-nexen-id="nx-8bc82b36-0">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground break-words sm:text-3xl" data-nexen-id="nx-8bc82b36-1">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground" data-nexen-id="nx-8bc82b36-2">
            {subtitle}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex w-full shrink-0 flex-wrap items-center gap-3 sm:w-auto sm:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
}

export default PageHeader;