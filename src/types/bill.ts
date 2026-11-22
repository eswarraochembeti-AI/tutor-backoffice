// Auto-generated from prisma/schema.prisma — canonical Bill shape.
// The API serializes these exact field names; UI components read them.
// Do not hand-edit — regenerate from the schema instead.

export const BILLSTATUS_VALUES = ['unpaid', 'paid'] as const;
export type BillStatus = 'unpaid' | 'paid';
export type BillStatusValue = BillStatus;

export interface Bill {
  id: string;
  createdAt: string;
  updatedAt: string;
  amount: string;
  dueDate: string;
  status: BillStatus;
  details?: string | null;
  paidAt?: string | null;
  title?: string | null;
}
