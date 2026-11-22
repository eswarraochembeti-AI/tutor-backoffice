import Link from 'next/link';

type FeatureLink = {
  label: string;
  href: string;
  description: string;
};

const FEATURE_LINKS: FeatureLink[] = [
  {
    label: 'View all students',
    href: '/students',
    description: 'Manage student details',
  },
  {
    label: 'View all invoices',
    href: '/invoices',
    description: 'See paid and unpaid invoices',
  },
  {
    label: 'New invoice',
    href: '/invoices/new',
    description: 'Generate this month’s invoices',
  },
  {
    label: 'Cash flow forecast',
    href: '/cash-flow',
    description: '30, 60 and 90 day outlook',
  },
  {
    label: 'What-if',
    href: '/what-if',
    description: 'See the effect of a late payment',
  },
  {
    label: 'Alerts',
    href: '/alerts',
    description: 'Invoices to chase today',
  },
];

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function FeatureLinks() {
  const safeLinks = Array.isArray(FEATURE_LINKS) ? FEATURE_LINKS : [];

  return (
    <nav data-nexen-component="nx_components_FeatureLinks" aria-label="Feature links" className="w-full" data-nexen-id="nx-edd6451e-0">
      <ul className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" data-nexen-id="nx-edd6451e-1">
        {safeLinks.map((link) => (
          <li key={link.href} className="min-w-0" data-nexen-id="nx-edd6451e-2">
            <Link
              href={link.href}
              className="group flex min-h-[72px] w-full items-center justify-between gap-3 rounded-[var(--radius)] border border-border bg-card px-5 py-4 text-left shadow-sm transition-colors hover:border-primary hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-primary/15"
             data-nexen-id="nx-edd6451e-3">
              <span className="flex min-w-0 flex-col" data-nexen-id="nx-edd6451e-4">
                <span className="truncate text-base font-semibold text-foreground" data-nexen-id="nx-edd6451e-5">
                  {link.label}
                </span>
                <span className="truncate text-sm text-muted-foreground" data-nexen-id="nx-edd6451e-6">
                  {link.description}
                </span>
              </span>
              <ArrowIcon />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}