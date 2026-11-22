// Auto-generated from prisma/schema.prisma — canonical Student shape.
// The API serializes these exact field names; UI components read them.
// Do not hand-edit — regenerate from the schema instead.

export const STUDENTSTATUS_VALUES = ['active', 'paused', 'ended'] as const;
export type StudentStatus = 'active' | 'paused' | 'ended';
export type StudentStatusValue = StudentStatus;

export interface Student {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  monthlyFee: string;
  status: StudentStatus;
  startDate: string;
  email?: string | null;
  phone?: string | null;
  guardian?: string | null;
}
