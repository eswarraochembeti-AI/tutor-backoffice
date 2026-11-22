// Demo data for the fee-collection app. Every date is computed from the time the seed
// runs (UTC midnight), so overdue and upcoming windows stay correct on any day.
// Safe to re-run: Invoice, Bill and Student rows are cleared first (children before parents).
// Note: prisma/schema.prisma has no Alert model, so no alerts are seeded.
import { Prisma, PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const DAY_MS = 24 * 60 * 60 * 1000;

// Today at UTC midnight.
function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

// Add whole days to a UTC-midnight date.
function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * DAY_MS);
}

// First day of the month containing d (UTC), used for billingMonth.
function firstOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

async function main() {
  const today = todayUtc();

  // Reset in foreign-key order. No tables are dropped.
  await db.invoice.deleteMany();
  await db.bill.deleteMany();
  await db.student.deleteMany();

  // ---- Students: 12, Indian names, +91 phones, example.com emails ----
  const studentSeed: Array<{
    name: string;
    monthlyFee: number;
    status: 'active' | 'paused' | 'ended';
    startDaysAgo: number;
    email: string;
    phone: string;
    guardian?: string;
  }> = [
    { name: 'Aarav Sharma', monthlyFee: 2500, status: 'active', startDaysAgo: 180, email: 'aarav.sharma@example.com', phone: '+91 98100 00101', guardian: 'Rajesh Sharma' },
    { name: 'Priya Raman', monthlyFee: 1800, status: 'active', startDaysAgo: 420, email: 'priya.raman@example.com', phone: '+91 98100 00102' },
    { name: 'Rohan Mehta', monthlyFee: 3200, status: 'active', startDaysAgo: 300, email: 'rohan.mehta@example.com', phone: '+91 98100 00103', guardian: 'Sunita Mehta' },
    { name: 'Ananya Iyer', monthlyFee: 2000, status: 'active', startDaysAgo: 540, email: 'ananya.iyer@example.com', phone: '+91 98100 00104' },
    { name: 'Vikram Singh', monthlyFee: 2800, status: 'active', startDaysAgo: 95, email: 'vikram.singh@example.com', phone: '+91 98100 00105' },
    { name: 'Kavya Nair', monthlyFee: 1500, status: 'active', startDaysAgo: 610, email: 'kavya.nair@example.com', phone: '+91 98100 00106', guardian: 'Suresh Nair' },
    { name: 'Arjun Patel', monthlyFee: 3500, status: 'active', startDaysAgo: 250, email: 'arjun.patel@example.com', phone: '+91 98100 00107' },
    { name: 'Meera Reddy', monthlyFee: 2200, status: 'active', startDaysAgo: 150, email: 'meera.reddy@example.com', phone: '+91 98100 00108' },
    { name: 'Siddharth Joshi', monthlyFee: 2400, status: 'paused', startDaysAgo: 400, email: 'siddharth.joshi@example.com', phone: '+91 98100 00109', guardian: 'Anjali Joshi' },
    { name: 'Neha Gupta', monthlyFee: 1900, status: 'active', startDaysAgo: 720, email: 'neha.gupta@example.com', phone: '+91 98100 00110' },
    { name: 'Ishaan Das', monthlyFee: 3000, status: 'active', startDaysAgo: 60, email: 'ishaan.das@example.com', phone: '+91 98100 00111' },
    { name: 'Diya Krishnan', monthlyFee: 2700, status: 'ended', startDaysAgo: 700, email: 'diya.krishnan@example.com', phone: '+91 98100 00112', guardian: 'Latha Krishnan' },
  ];

  const students: Array<{ id: string; monthlyFee: number }> = [];
  for (const s of studentSeed) {
    const created = await db.student.create({
      data: {
        name: s.name,
        monthlyFee: s.monthlyFee,
        status: s.status,
        startDate: addDays(today, -s.startDaysAgo),
        email: s.email,
        phone: s.phone,
        guardian: s.guardian,
      },
    });
    students.push({ id: created.id, monthlyFee: s.monthlyFee });
  }

  // ---- Invoices ----
  // Schema InvoiceStatus is issued | paid; "unpaid" in the plan maps to "issued".
  const invoices: Prisma.InvoiceUncheckedCreateInput[] = [];

  // Paid invoices in past months: students 0-3, last two billing months.
  for (const i of [0, 1, 2, 3]) {
    for (const monthsBack of [1, 2]) {
      const billingMonth = firstOfMonth(addDays(today, -monthsBack * 30));
      const dueDate = addDays(billingMonth, 6);
      invoices.push({
        studentId: students[i].id,
        billingMonth,
        amount: students[i].monthlyFee,
        status: 'paid',
        dueDate,
        paidAt: addDays(dueDate, -2),
        paidAmount: students[i].monthlyFee,
        issuedDate: billingMonth,
      });
    }
  }

  // Unpaid and overdue: due 5, 12, 25, 45 days ago. Active students 5, 6, 7, 9.
  const overdueOffsets = [5, 12, 25, 45];
  const overdueStudents = [5, 6, 7, 9];
  overdueOffsets.forEach((daysAgo, k) => {
    const i = overdueStudents[k];
    const dueDate = addDays(today, -daysAgo);
    const billingMonth = firstOfMonth(dueDate);
    invoices.push({
      studentId: students[i].id,
      billingMonth,
      amount: students[i].monthlyFee,
      status: 'issued',
      dueDate,
      issuedDate: billingMonth,
    });
  });

  // Unpaid and upcoming: 8 invoices, due in 0-30, 31-60 and 61-90 day windows.
  const upcomingOffsets = [5, 12, 28, 35, 55, 65, 75, 85];
  upcomingOffsets.forEach((daysAhead, i) => {
    const dueDate = addDays(today, daysAhead);
    const billingMonth = firstOfMonth(dueDate);
    invoices.push({
      studentId: students[i].id,
      billingMonth,
      amount: students[i].monthlyFee,
      status: 'issued',
      dueDate,
      issuedDate: billingMonth,
    });
  });

  await db.invoice.createMany({ data: invoices });

  // ---- Bills (₹) ----
  const bills: Prisma.BillUncheckedCreateInput[] = [
    // Paid, due 3-50 days ago.
    { title: 'Rent', amount: 24500, dueDate: addDays(today, -35), status: 'paid', paidAt: addDays(today, -36), details: 'Centre premises rent, monthly' },
    { title: 'Internet', amount: 1199, dueDate: addDays(today, -20), status: 'paid', paidAt: addDays(today, -21), details: 'Fibre broadband plan' },
    { title: 'Electricity', amount: 2850, dueDate: addDays(today, -12), status: 'paid', paidAt: addDays(today, -13), details: 'Electricity bill, previous cycle' },
    { title: 'Software subscription', amount: 899, dueDate: addDays(today, -5), status: 'paid', paidAt: addDays(today, -6), details: 'Scheduling software, monthly' },
    { title: 'Transport', amount: 2200, dueDate: addDays(today, -50), status: 'paid', paidAt: addDays(today, -51), details: 'Travel between student homes' },
    // Unpaid, spread over the next 90 days.
    { title: 'Rent', amount: 24500, dueDate: addDays(today, 7), status: 'unpaid', details: 'Centre premises rent, monthly' },
    { title: 'Teaching materials', amount: 3650, dueDate: addDays(today, 14), status: 'unpaid', details: 'Workbooks and printed mock papers' },
    { title: 'Internet', amount: 1199, dueDate: addDays(today, 22), status: 'unpaid', details: 'Fibre broadband plan' },
    { title: 'Electricity', amount: 1950, dueDate: addDays(today, 30), status: 'unpaid', details: 'Electricity bill, current cycle' },
    { title: 'Insurance', amount: 4200, dueDate: addDays(today, 48), status: 'unpaid', details: 'Liability insurance, instalment' },
    { title: 'Software subscription', amount: 1499, dueDate: addDays(today, 58), status: 'unpaid', details: 'Scheduling software, annual plan' },
    { title: 'Transport', amount: 2200, dueDate: addDays(today, 70), status: 'unpaid', details: 'Travel between student homes' },
    { title: 'Teaching materials', amount: 1800, dueDate: addDays(today, 85), status: 'unpaid', details: 'Practice test booklets' },
  ];

  await db.bill.createMany({ data: bills });

  // ---- Counts ----
  const invoicePaid = invoices.filter((x) => x.status === 'paid').length;
  const invoiceOverdue = invoices.filter((x) => x.status === 'issued' && x.dueDate < today).length;
  const invoiceUpcoming = invoices.filter((x) => x.status === 'issued' && x.dueDate >= today).length;
  const billPaid = bills.filter((x) => x.status === 'paid').length;
  const billUnpaid = bills.filter((x) => x.status === 'unpaid').length;

  console.log(`[seed] Students: ${students.length}`);
  console.log(`[seed] Invoices: ${invoices.length} (paid ${invoicePaid}, overdue ${invoiceOverdue}, upcoming ${invoiceUpcoming})`);
  console.log(`[seed] Bills: ${bills.length} (paid ${billPaid}, unpaid ${billUnpaid})`);
  console.log('[seed] Alerts: 0 (no Alert model in prisma/schema.prisma)');
}

main()
  .then(async () => { await db.$disconnect(); })
  .catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(0); });
