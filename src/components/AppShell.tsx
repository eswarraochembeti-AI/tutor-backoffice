'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard' },
  { href: '/students', label: 'Students' },
  { href: '/invoices', label: 'Invoices' },
  { href: '/cash-flow-forecast', label: 'Cash Flow Forecast' },
  { href: '/what-if', label: 'What-If' },
  { href: '/alerts', label: 'Alerts' },
  { href: '/bills', label: 'Bills' },
];

const PRODUCT_NAME = 'TutorLedger';

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="ui-shell flex min-h-screen w-full min-w-0 flex-col bg-background text-foreground sm:flex-row">
      <aside className="ui-sidebar sticky top-0 z-10 flex w-full min-w-0 flex-col border-b border-border bg-card sm:h-screen sm:w-60 sm:shrink-0 sm:border-b-0 sm:border-r" data-nexen-id="nx-2bffa68a-0">
        <div className="ui-brand flex items-center justify-between gap-3 p-4">
          <div className="flex min-w-0 items-center gap-2">
            <img src="/nexen-logo.svg" alt="" className="h-7 w-7 shrink-0"  data-nexen-id="nx-2bffa68a-1"/>
            <span className="truncate text-base font-bold text-foreground" data-nexen-id="nx-2bffa68a-2">
              {PRODUCT_NAME}
            </span>
          </div>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="app-shell-nav"
            onClick={() => setOpen((value) => !value)}
            className="shrink-0 rounded-[var(--radius)] border border-border px-3 py-1.5 text-sm font-medium text-foreground sm:hidden"
           data-nexen-id="nx-2bffa68a-3">
            {open ? 'Close' : 'Menu'}
          </button>
        </div>

        <nav
          id="app-shell-nav"
          aria-label="Main navigation"
          className={`ui-nav ${open ? 'flex' : 'hidden'} flex-col gap-1 px-2 pb-4 sm:flex sm:px-3`}
         data-nexen-id="nx-2bffa68a-4">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className={`block min-w-0 truncate rounded-[var(--radius)] px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                }`}
               data-nexen-id="nx-2bffa68a-5">
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main data-nexen-component="nx_components_AppShell" className="ui-content min-w-0 flex-1 overflow-x-hidden" data-nexen-id="nx-2bffa68a-6">
        {children}
      </main>
    </div>
  );
}