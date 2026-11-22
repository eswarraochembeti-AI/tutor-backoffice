// Auto-generated from prisma/schema.prisma — canonical Invoice shape.
// The API serializes these exact field names; UI components read them.
// Do not hand-edit — regenerate from the schema instead.

export const INVOICESTATUS_VALUES = ['issued', 'paid'] as const;
export type InvoiceStatus = 'issued' | 'paid';
export type InvoiceStatusValue = InvoiceStatus;

export interface Invoice {
  id: string;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  billingMonth: string;
  amount: string;
  status: InvoiceStatus;
  dueDate: string;
  paidAt?: string | null;
  paidAmount?: string | null;
  issuedDate?: string | null;
}
