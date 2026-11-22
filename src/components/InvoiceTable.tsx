import Link from 'next/link';

export interface InvoiceRow {
  id: string;
  studentName?: string;
  billingMonth: string;
  amount: string | number;
  dueDate: string;
  status: string;
}

interface InvoiceTableProps {
  invoices?: InvoiceRow[] | null;
}

const formatAmount = (value: string | number) => `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

const formatMonth = (value: string) =>
  new Date(value).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

const isPaid = (status: string) => status === 'paid';

function StatusPill({ status }: { status: string }) {
  const paid = isPaid(status);
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-[999px] px-2.5 py-0.5 text-xs font-medium ${
        paid ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
      }`}
     data-nexen-id="nx-6f93262a-0">
      {paid ? 'Paid' : 'Unpaid'}
    </span>
  );
}

export default function InvoiceTable({ invoices }: InvoiceTableProps) {
  const safeInvoices = Array.isArray(invoices) ? invoices : [];

  if (safeInvoices.length === 0) {
    return (
      <div className="rounded-[var(--radius)] border border-dashed border-border bg-card p-8 text-center">
        <p className="text-sm font-medium text-foreground" data-nexen-id="nx-6f93262a-1">No invoices yet</p>
        <p className="mt-1 text-sm text-muted-foreground" data-nexen-id="nx-6f93262a-2">
          Generate this month&apos;s invoices to see them here.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: stacked cards */}
      <ul data-nexen-component="nx_components_InvoiceTable" className="flex flex-col gap-3 sm:hidden" data-nexen-id="nx-6f93262a-3">
        {safeInvoices.map((invoice) => (
          <li key={invoice.id} data-nexen-id="nx-6f93262a-4">
            <Link
              href={`/invoices/${invoice.id}`}
              className="flex flex-col gap-2 rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm"
             data-nexen-id="nx-6f93262a-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground" data-nexen-id="nx-6f93262a-6">{invoice.studentName}</p>
                  <p className="text-sm text-muted-foreground" data-nexen-id="nx-6f93262a-7">{formatMonth(invoice.billingMonth)}</p>
                </div>
                <StatusPill status={invoice.status} />
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-foreground" data-nexen-id="nx-6f93262a-8">{formatAmount(invoice.amount)}</span>
                <span className="text-muted-foreground" data-nexen-id="nx-6f93262a-9">Due {formatDate(invoice.dueDate)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto rounded-[var(--radius)] border border-border bg-card shadow-sm sm:block">
        <table className="w-full border-collapse text-sm" data-nexen-id="nx-6f93262a-10">
          <thead data-nexen-id="nx-6f93262a-11">
            <tr className="text-left text-muted-foreground" data-nexen-id="nx-6f93262a-12">
              <th className="border-b border-border px-4 py-3 font-medium" data-nexen-id="nx-6f93262a-13">Student</th>
              <th className="border-b border-border px-4 py-3 font-medium" data-nexen-id="nx-6f93262a-14">Month</th>
              <th className="border-b border-border px-4 py-3 font-medium" data-nexen-id="nx-6f93262a-15">Amount</th>
              <th className="border-b border-border px-4 py-3 font-medium" data-nexen-id="nx-6f93262a-16">Due date</th>
              <th className="border-b border-border px-4 py-3 font-medium" data-nexen-id="nx-6f93262a-17">Status</th>
            </tr>
          </thead>
          <tbody data-nexen-id="nx-6f93262a-18">
            {safeInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-primary/5" data-nexen-id="nx-6f93262a-19">
                <td className="border-b border-border px-4 py-3" data-nexen-id="nx-6f93262a-20">
                  <Link href={`/invoices/${invoice.id}`} className="font-medium text-foreground hover:underline" data-nexen-id="nx-6f93262a-21">
                    {invoice.studentName}
                  </Link>
                </td>
                <td className="border-b border-border px-4 py-3 text-muted-foreground" data-nexen-id="nx-6f93262a-22">
                  {formatMonth(invoice.billingMonth)}
                </td>
                <td className="border-b border-border px-4 py-3 text-foreground" data-nexen-id="nx-6f93262a-23">
                  {formatAmount(invoice.amount)}
                </td>
                <td className="border-b border-border px-4 py-3 text-muted-foreground" data-nexen-id="nx-6f93262a-24">
                  {formatDate(invoice.dueDate)}
                </td>
                <td className="border-b border-border px-4 py-3" data-nexen-id="nx-6f93262a-25">
                  <StatusPill status={invoice.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}