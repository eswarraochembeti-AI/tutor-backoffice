'use client';

// Auto-generated typed API client — the app's single fetch surface.
// Request bodies are typed against the database schema, so calling an
// endpoint with the wrong field names is a compile error. Do not hand-
// edit — regenerate from the API atlas + schema instead.

import { getToken } from '@/lib/authToken';

// Mock mode: the IDE preview boots before any database exists, so the
// single fetch surface answers locally instead of calling routes that
// would fail on a missing DATABASE_URL. Mirrors the demo session in
// @/lib/authContext so both auth surfaces agree.
// The `process.env.NEXT_PUBLIC_MOCK_MODE` form is deliberate: Next inlines
// that EXACT text at build time. `process.env?.X` or a computed key is not
// matched by the inliner, so it would compile to a lookup that is always
// undefined in the browser bundle — the same way a dynamic
// `process.env['NEXT_PUBLIC_' + name]` once left the preview inspector
// permanently inert. Do not add optional chaining here.
const __NEXEN_IS_MOCK__ =
  (typeof process !== 'undefined' &&
    process.env.NEXT_PUBLIC_MOCK_MODE === 'true') ||
  (typeof process !== 'undefined' && process.env.MOCK_MODE === 'true') ||
  ((globalThis as unknown as { __NEXEN_MOCK__?: boolean }).__NEXEN_MOCK__ === true);

const __NEXEN_DEMO_USER__ = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'demo@example.com',
  name: 'Demo User',
  role: 'tutor',
};

const __NEXEN_MOCK_ROWS__: Record<string, any[]> = {
  "students": [
    {
      "id": "student_001",
      "createdAt": "2026-01-15T10:00:00Z",
      "updatedAt": "2026-01-15T10:00:00Z",
      "name": "Priya Raman",
      "monthlyFee": 320,
      "status": "active",
      "startDate": "2024-09-02T00:00:00Z",
      "email": "anita.raman@example.com",
      "phone": "+1 555 010 2231",
      "guardian": "Anita Raman"
    },
    {
      "id": "student_002",
      "createdAt": "2026-02-15T10:00:00Z",
      "updatedAt": "2026-02-15T10:00:00Z",
      "name": "Liam Okafor",
      "monthlyFee": 280,
      "status": "active",
      "startDate": "2025-01-13T00:00:00Z",
      "email": "daniel.okafor@example.com",
      "phone": "+1 555 010 4478",
      "guardian": "sample_guardian_2"
    },
    {
      "id": "student_003",
      "createdAt": "2026-03-15T10:00:00Z",
      "updatedAt": "2026-03-15T10:00:00Z",
      "name": "Chloe Dubois",
      "monthlyFee": 350,
      "status": "active",
      "startDate": "2024-11-04T00:00:00Z",
      "email": "chloe.dubois@example.com",
      "phone": "sample_phone_3",
      "guardian": "sample_guardian_3"
    },
    {
      "id": "student_004",
      "createdAt": "2026-04-15T10:00:00Z",
      "updatedAt": "2026-04-15T10:00:00Z",
      "name": "Ethan Brooks",
      "monthlyFee": 260,
      "status": "paused",
      "startDate": "2024-06-10T00:00:00Z",
      "email": "priya.sharma@example.com",
      "phone": "+1 555 010 7790",
      "guardian": "Marcus Brooks"
    },
    {
      "id": "student_005",
      "createdAt": "2026-05-15T10:00:00Z",
      "updatedAt": "2026-05-15T10:00:00Z",
      "name": "Sofia Marín",
      "monthlyFee": 300,
      "status": "active",
      "startDate": "2025-02-03T00:00:00Z",
      "email": "sofia.marin@example.com",
      "phone": "+1 555 010 3365",
      "guardian": "sample_guardian_5"
    },
    {
      "id": "student_006",
      "createdAt": "2026-06-15T10:00:00Z",
      "updatedAt": "2026-06-15T10:00:00Z",
      "name": "Noah Kim",
      "monthlyFee": 240,
      "status": "ended",
      "startDate": "2023-08-21T00:00:00Z",
      "email": "grace.kim@example.com",
      "phone": "sample_phone_6",
      "guardian": "sample_guardian_6"
    }
  ],
  "invoices": [
    {
      "id": "invoice_001",
      "createdAt": "2026-01-15T10:00:00Z",
      "updatedAt": "2026-01-15T10:00:00Z",
      "studentId": "student_001",
      "billingMonth": "2025-05-01T00:00:00Z",
      "amount": 320,
      "status": "paid",
      "dueDate": "2025-05-07T00:00:00Z",
      "paidAt": "2025-05-05T10:20:00Z",
      "paidAmount": 320,
      "issuedDate": "2025-05-01T00:00:00Z"
    },
    {
      "id": "invoice_002",
      "createdAt": "2026-02-15T10:00:00Z",
      "updatedAt": "2026-02-15T10:00:00Z",
      "studentId": "student_002",
      "billingMonth": "2025-05-01T00:00:00Z",
      "amount": 280,
      "status": "issued",
      "dueDate": "2025-05-07T00:00:00Z",
      "paidAt": "2026-02-15T10:00:00Z",
      "paidAmount": "sample_paidamount_2",
      "issuedDate": "2025-05-01T00:00:00Z"
    },
    {
      "id": "invoice_003",
      "createdAt": "2026-03-15T10:00:00Z",
      "updatedAt": "2026-03-15T10:00:00Z",
      "studentId": "student_003",
      "billingMonth": "2025-05-01T00:00:00Z",
      "amount": 350,
      "status": "paid",
      "dueDate": "2025-05-07T00:00:00Z",
      "paidAt": "2025-05-14T09:00:00Z",
      "paidAmount": 350,
      "issuedDate": "2025-05-01T00:00:00Z"
    },
    {
      "id": "invoice_004",
      "createdAt": "2026-04-15T10:00:00Z",
      "updatedAt": "2026-04-15T10:00:00Z",
      "studentId": "student_004",
      "billingMonth": "2025-04-01T00:00:00Z",
      "amount": 300,
      "status": "issued",
      "dueDate": "2025-04-07T00:00:00Z",
      "paidAt": "2026-04-15T10:00:00Z",
      "paidAmount": "sample_paidamount_4",
      "issuedDate": "2025-04-01T00:00:00Z"
    },
    {
      "id": "invoice_005",
      "createdAt": "2026-05-15T10:00:00Z",
      "updatedAt": "2026-05-15T10:00:00Z",
      "studentId": "student_005",
      "billingMonth": "2025-04-01T00:00:00Z",
      "amount": 260,
      "status": "paid",
      "dueDate": "2025-04-07T00:00:00Z",
      "paidAt": "2025-04-06T16:45:00Z",
      "paidAmount": 260,
      "issuedDate": "2025-04-01T00:00:00Z"
    },
    {
      "id": "invoice_006",
      "createdAt": "2026-06-15T10:00:00Z",
      "updatedAt": "2026-06-15T10:00:00Z",
      "studentId": "student_006",
      "billingMonth": "2025-06-01T00:00:00Z",
      "amount": 320,
      "status": "issued",
      "dueDate": "2025-06-07T00:00:00Z",
      "paidAt": "2026-06-15T10:00:00Z",
      "paidAmount": "sample_paidamount_6",
      "issuedDate": "2025-06-01T00:00:00Z"
    }
  ],
  "bills": [
    {
      "id": "bill_001",
      "createdAt": "2026-01-15T10:00:00Z",
      "updatedAt": "2026-01-15T10:00:00Z",
      "amount": 145,
      "dueDate": "2025-06-15T00:00:00Z",
      "status": "unpaid",
      "details": "Electricity and internet, May billing cycle",
      "paidAt": "2026-01-15T10:00:00Z",
      "title": "Home office utilities"
    },
    {
      "id": "bill_002",
      "createdAt": "2026-02-15T10:00:00Z",
      "updatedAt": "2026-02-15T10:00:00Z",
      "amount": 210,
      "dueDate": "2025-05-30T00:00:00Z",
      "status": "paid",
      "details": "Spring cohort registration fees",
      "paidAt": "2025-05-28T14:00:00Z",
      "title": "Exam board registration"
    },
    {
      "id": "bill_003",
      "createdAt": "2026-03-15T10:00:00Z",
      "updatedAt": "2026-03-15T10:00:00Z",
      "amount": 86.5,
      "dueDate": "2025-06-20T00:00:00Z",
      "status": "unpaid",
      "details": "Workbooks and printed mock papers",
      "paidAt": "2026-03-15T10:00:00Z",
      "title": "Teaching materials"
    },
    {
      "id": "bill_004",
      "createdAt": "2026-04-15T10:00:00Z",
      "updatedAt": "2026-04-15T10:00:00Z",
      "amount": 24,
      "dueDate": "2025-06-02T00:00:00Z",
      "status": "paid",
      "details": "Monthly lesson calendar subscription",
      "paidAt": "2025-06-01T08:30:00Z",
      "title": "Scheduling software"
    },
    {
      "id": "bill_005",
      "createdAt": "2026-05-15T10:00:00Z",
      "updatedAt": "2026-05-15T10:00:00Z",
      "amount": 340,
      "dueDate": "2025-07-01T00:00:00Z",
      "status": "unpaid",
      "details": "Annual renewal, first instalment",
      "paidAt": "2026-05-15T10:00:00Z",
      "title": "Liability insurance"
    },
    {
      "id": "bill_006",
      "createdAt": "2026-06-15T10:00:00Z",
      "updatedAt": "2026-06-15T10:00:00Z",
      "amount": 92.4,
      "dueDate": "2025-05-25T00:00:00Z",
      "status": "paid",
      "details": "Travel between student homes",
      "paidAt": "2025-05-24T18:15:00Z",
      "title": "Car fuel"
    }
  ]
};

// ── Sample-data changes: kept for this browser tab ──────────────────────────
const __NEXEN_SAMPLE_KEY__ = 'nexen.sample.3d52ba1f9592';
let __sampleLoaded = false;
const __sampleCreated = new Set<string>();
const __sampleAnswered = new WeakMap<object, any>();
function __sampleTables(): string[] {
  const keys = Object.keys(__NEXEN_MOCK_ROWS__);
  return keys.filter((k, i) => keys.findIndex((j) => __NEXEN_MOCK_ROWS__[j] === __NEXEN_MOCK_ROWS__[k]) === i);
}
function __sampleLoad(): void {
  if (__sampleLoaded) return;
  __sampleLoaded = true;
  try {
    const saved = JSON.parse(globalThis.sessionStorage?.getItem(__NEXEN_SAMPLE_KEY__) ?? 'null');
    if (!saved || typeof saved !== 'object') return;
    for (const t of __sampleTables()) {
      const kept = saved.rows?.[t];
      if (Array.isArray(kept)) __NEXEN_MOCK_ROWS__[t].splice(0, __NEXEN_MOCK_ROWS__[t].length, ...kept);
    }
    for (const id of Array.isArray(saved.created) ? saved.created : []) __sampleCreated.add(String(id));
  } catch { /* blocked or unreadable storage: the sample rows as shipped */ }
}
function __sampleSave(): void {
  try {
    const rows: Record<string, any[]> = {};
    for (const t of __sampleTables()) rows[t] = __NEXEN_MOCK_ROWS__[t];
    globalThis.sessionStorage?.setItem(__NEXEN_SAMPLE_KEY__, JSON.stringify({ rows, created: Array.from(__sampleCreated) }));
  } catch { /* full or blocked: kept until the page reloads */ }
  // The IDE preview says, once, that this went to sample data only.
  try {
    if (typeof window !== 'undefined' && window.parent !== window) window.parent.postMessage({ type: 'nexen:sample-write' }, '*');
  } catch { /* no preview around this page */ }
}
function __sampleFind(all: any[], id: string): number {
  return all.findIndex((r) => String(r.id) === String(id) || String(r.slug) === String(id));
}
/** A field the person did not fill, as a new row of theirs would hold it. Links and
 *  status-like values keep a sample row's (pages read them); its text, dates and counts do
 *  not: a new habit showed "Sample description for record 1" and its reminder. */
function __sampleBlank(k: string, v: any): any {
  if (/(Id|_id)$/.test(k) || /status|state|role|type|kind|priority|category|level|currency|unit|visibility/i.test(k)) return v;
  if (Array.isArray(v)) return [];
  if (v && typeof v === 'object') return v;
  if (typeof v === 'number') return 0;
  if (typeof v === 'boolean') return false;
  return null;
}
/** A new row: a sample row's fields (what pages read), the person's values in them. */
function __sampleInsert(table: string, body: any, links?: Record<string, string>): any {
  if (body && typeof body === 'object' && __sampleAnswered.has(body)) return __sampleAnswered.get(body);
  __sampleLoad();
  const all = __NEXEN_MOCK_ROWS__[table] ?? (__NEXEN_MOCK_ROWS__[table] = []);
  const like: any = all[0] ?? {};
  const now = new Date().toISOString();
  const row: any = {};
  for (const [k, v] of Object.entries(like)) row[k] = __sampleBlank(k, v);
  Object.assign(row, body && typeof body === 'object' ? body : {}, links ?? {});
  row.id = typeof like.id === 'number'
    ? all.reduce((m: number, r: any) => Math.max(m, Number(r.id) || 0), 0) + 1
    : (globalThis.crypto?.randomUUID?.() ?? `sample-${Date.now().toString(36)}`);
  if ('slug' in like && !(body && body.slug)) row.slug = String(row.id);
  for (const k of ['createdAt', 'updatedAt', 'created_at', 'updated_at']) if (k in like) row[k] = now;
  all.unshift(row);
  __sampleCreated.add(String(row.id));
  if (body && typeof body === 'object') __sampleAnswered.set(body, row);
  __sampleSave();
  return row;
}
function __sampleUpdate(table: string, id: string, body: any): any {
  __sampleLoad();
  const all = __NEXEN_MOCK_ROWS__[table] ?? [];
  const changes: any = { ...(body && typeof body === 'object' ? body : {}) };
  delete changes.id;
  const i = __sampleFind(all, id);
  if (i < 0) return { ...__mockRow(table, id), ...changes };
  Object.assign(all[i], changes);
  for (const k of ['updatedAt', 'updated_at']) if (k in all[i]) all[i][k] = new Date().toISOString();
  __sampleSave();
  return all[i];
}
function __sampleDelete(table: string, id: string): undefined {
  __sampleLoad();
  const all = __NEXEN_MOCK_ROWS__[table] ?? [];
  const i = __sampleFind(all, id);
  if (i >= 0) {
    all.splice(i, 1);
    __sampleSave();
  }
  return undefined;
}
/** A write no designed endpoint answers, applied to the table its path names. */
function __sampleWrite(method: string, path: string, body: any): any {
  const segs = path.split('/').filter(Boolean);
  for (let i = segs.length - 1; i >= 0; i -= 1) {
    if (!__NEXEN_MOCK_ROWS__[segs[i]]) continue;
    if (i === segs.length - 1 && method === 'POST') return __sampleInsert(segs[i], body);
    if (i === segs.length - 2 && (method === 'PATCH' || method === 'PUT')) return __sampleUpdate(segs[i], decodeURIComponent(segs[i + 1]), body);
    if (i === segs.length - 2 && method === 'DELETE') return __sampleDelete(segs[i], decodeURIComponent(segs[i + 1]));
    return undefined;
  }
  return undefined;
}

function __mockRows(table: string, where?: Record<string, string>): any[] {
  __sampleLoad();
  const all = __NEXEN_MOCK_ROWS__[table] ?? [];
  if (!where || !Object.keys(where).length) return all;
  const hit = all.filter((r) => Object.entries(where).every(([k, v]) => String(r[k]) === String(v)));
  // A parent added in this tab has no children yet: none, not every sample row.
  return hit.length || Object.values(where).some((v) => __sampleCreated.has(String(v))) ? hit : all;
}

function __mockRow(table: string, id?: string): any {
  __sampleLoad();
  const all = __NEXEN_MOCK_ROWS__[table] ?? [];
  return (id !== undefined && all.find((r) => String(r.id) === String(id) || String(r.slug) === String(id))) || all[0] || {};
}

/** One answer per designed endpoint, in the shape the API Layer declares for it. */
const __NEXEN_MOCK_ROUTES__: Array<[string, RegExp, (p: string[], body: any) => any]> = [
  ["POST", /^\/api\/invoices\/generate$/, (p, body) => ({ "created": 3, "skipped": 3 })],
  ["GET", /^\/api\/cash-flow-forecast$/, (p, body) => ({ "days_30": ({ "cash_in": 3, "cash_out": 3, "net": 3 }), "days_60": ({ "cash_in": 3, "cash_out": 3, "net": 3 }), "days_90": ({ "cash_in": 3, "cash_out": 3, "net": 3 }) })],
  ["GET", /^\/api\/overdue-invoices$/, (p, body) => [({ "invoice_id": "invoice__001", "student_name": "sample_student_name_1", "amount_owed": 3, "due_date": "2026-01-15T10:00:00Z", "days_overdue": 3 })]],
  ["GET", /^\/api\/dashboard$/, (p, body) => ({ "total_outstanding": 3, "students": [({ "student_id": "student__001", "name": "Jane Doe", "amount_owed": 3, "days_overdue": 3 })] })],
  ["GET", /^\/api\/students$/, (p, body) => __mockRows("students")],
  ["POST", /^\/api\/students$/, (p, body) => __sampleInsert("students", body)],
  ["GET", /^\/api\/invoices$/, (p, body) => __mockRows("invoices")],
  ["GET", /^\/api\/alerts$/, (p, body) => [({ "alert_id": "alert__001", "invoice_id": "invoice__001", "student_name": "sample_student_name_1", "amount_owed": 3, "days_overdue": 3, "alert_date": "2026-01-15T10:00:00Z", "status": "active" })]],
  ["GET", /^\/api\/bills$/, (p, body) => __mockRows("bills")],
  ["POST", /^\/api\/bills$/, (p, body) => __sampleInsert("bills", body)],
  ["POST", /^\/api\/invoices\/([^\/]+)\/mark-paid$/, (p, body) => __mockRow("invoices", p[0])],
  ["GET", /^\/api\/students\/([^\/]+)\/what-if$/, (p, body) => ({ "student_name": "sample_student_name_1", "delay_days": 3, "shifted_amount": 3, "cash_in_change_30": 3, "cash_in_change_60": 3, "cash_in_change_90": 3 })],
  ["POST", /^\/api\/bills\/([^\/]+)\/mark-paid$/, (p, body) => __mockRow("bills", p[0])],
  ["GET", /^\/api\/students\/([^\/]+)$/, (p, body) => __mockRow("students", p[0])],
  ["PATCH", /^\/api\/students\/([^\/]+)$/, (p, body) => __sampleUpdate("students", p[0], body)],
  ["DELETE", /^\/api\/students\/([^\/]+)$/, (p, body) => __sampleDelete("students", p[0])],
  ["GET", /^\/api\/invoices\/([^\/]+)$/, (p, body) => ({ ...(__mockRow("invoices", p[0])), ...(({ "student_name": "sample_student_name_1", "days_overdue": 3 })) })],
  ["PATCH", /^\/api\/invoices\/([^\/]+)$/, (p, body) => __sampleUpdate("invoices", p[0], body)],
  ["DELETE", /^\/api\/invoices\/([^\/]+)$/, (p, body) => __sampleDelete("invoices", p[0])],
  ["PATCH", /^\/api\/bills\/([^\/]+)$/, (p, body) => __sampleUpdate("bills", p[0], body)],
  ["DELETE", /^\/api\/bills\/([^\/]+)$/, (p, body) => __sampleDelete("bills", p[0])],
  ["GET", /^\/api\/bills\/([^\/]+)$/, (p, body) => __mockRow("bills", p[0])],
];

/** What `http()` returns in mock mode. Sign-in paths hand back the demo
 *  session @/lib/authContext uses. Every endpoint the API Layer designed
 *  answers in its own declared shape (`__NEXEN_MOCK_ROUTES__`), built from
 *  the same sample rows the database seed uses, and passed through the
 *  same `unwrap` a real answer gets — so a screen that works here reads
 *  the fields it will read against the real routes.
 *
 *  The `/me` rule is anchored to the END of the path: unanchored, it
 *  caught `/api/me/orders` and answered every "my ..." screen with the
 *  demo user. */
function __nexenMockResponse(url: string, init?: RequestInit): any {
  const method = (init?.method ?? 'GET').toUpperCase();
  const __path = String(url).split('?')[0].replace(/\/+$/, '') || '/';
  __sampleLoad();
  if (/\/(login|register|signup|sign-up|sign-in|signin)$/.test(__path)) {
    return { token: 'nexen-mock-token', user: __NEXEN_DEMO_USER__ };
  }
  if (/\/(logout|sign-out|signout)$/.test(__path)) return { ok: true };
  let __body: any = {};
  try { __body = init?.body ? JSON.parse(String(init.body)) : {}; } catch { __body = {}; }
  for (const [m, re, answer] of __NEXEN_MOCK_ROUTES__) {
    if (m !== method) continue;
    const hit = re.exec(__path);
    if (hit) return unwrap(answer(hit.slice(1).map(decodeURIComponent), __body));
  }
  if (method === 'GET' && /\/auth\/(me|session|user)$|^\/api\/(me|profile)$|\/users\/me$/.test(__path)) {
    return __NEXEN_DEMO_USER__;
  }
  // No designed answer: a write changes the rows its path names, kept for this
  // tab (`__sampleWrite`); else it echoes its body so optimistic UI still
  // renders. A read finds the rows its path names.
  if (method !== 'GET') {
    const written = __sampleWrite(method, __path, __body);
    if (written !== undefined || method === 'DELETE') return written;
  }
  if (method !== 'GET' && init?.body) return __body;
  const __segs = __path.split('/').filter(Boolean);
  for (let i = __segs.length - 1; i >= 0; i -= 1) {
    const rows = __NEXEN_MOCK_ROWS__[__segs[i]];
    if (!rows) continue;
    const isItem = i === __segs.length - 2;
    return isItem ? __mockRow(__segs[i], __segs[i + 1]) : rows;
  }
  return {};
}

import type { Bill } from '@/types/bill';
import type { Invoice } from '@/types/invoice';
import type { Student } from '@/types/student';

// Request payloads take money fields as a number or a string: the forms send
// numbers (Number(...)), while the entity types keep the API's serialized string.
type BillInput = Partial<Omit<Bill, 'createdAt' | 'deletedAt' | 'id' | 'updatedAt' | 'amount'>> & { amount?: number | string };
type StudentInput = Partial<Omit<Student, 'createdAt' | 'deletedAt' | 'id' | 'updatedAt' | 'monthlyFee'>> & { monthlyFee?: number | string };
type InvoiceInput = Partial<Omit<Invoice, 'createdAt' | 'deletedAt' | 'id' | 'updatedAt' | 'amount'>> & { amount?: number | string };

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function withQuery(
  url: string,
  query?: Record<string, string | number | boolean | undefined>,
): string {
  if (!query) return url;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null) qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `${url}?${s}` : url;
}

// ONE envelope convention, applied here so nothing downstream has to think
// about it: route handlers return the entity WRAPPED — `{ task }`, `{ projects }`
// — matching the `{ error }` shape errors already use and leaving room for
// `{ data, meta }` later. This unwraps it, so hooks and pages only ever see
// entities.
//
// Without a single decision, some generated consumers unwrapped and some did
// not: `useTask` stored `{ task: {...} }` as the task itself while the page
// next to it got it right. Both were plausible readings of an unstated rule.
function unwrap(payload: any): any {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    return payload;
  }
  const keys = Object.keys(payload);
  // A single-key object whose key is not a known envelope field IS the
  // envelope. Anything else is already the entity — unwrapping a real
  // one-field entity would be worse than leaving a wrapper on.
  if (keys.length === 1 && !['error', 'message', 'ok'].includes(keys[0])) {
    return payload[keys[0]];
  }
  return payload;
}

async function http(url: string, init?: RequestInit): Promise<any> {
  // No database exists during the preview — answer locally.
  if (__NEXEN_IS_MOCK__) return __nexenMockResponse(url, init);
  // Unified-Next: same-origin relative URLs. Auth is DUAL — the login route
  // sets an httpOnly session cookie AND returns the JWT, which the login form
  // persists via @/lib/authToken. We attach it as `Authorization: Bearer` here
  // because the cookie is withheld inside the IDE preview's cross-site iframe;
  // `credentials: 'include'` keeps the cookie working in a normal browser too.
  const token = typeof window !== 'undefined' ? getToken() : null;
  const res = await fetch(url, {
    ...init,
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((init?.headers as Record<string, string> | undefined) ?? {}),
    },
  });
  if (!res.ok) {
    throw new ApiError(res.status, await res.text().catch(() => res.statusText));
  }
  if (res.status === 204) return undefined;
  return unwrap(await res.json().catch(() => undefined));
}

export async function getDashboard(query?: Record<string, string | number | boolean | undefined>): Promise<{ total_outstanding: number; students: Array<{ student_id: string; name: string; amount_owed: number; days_overdue: number }> }> {
  return http(withQuery(`/api/dashboard`, query));
}
export async function getOverdueInvoices(query?: Record<string, string | number | boolean | undefined>): Promise<Array<{ invoice_id: string; student_name: string; amount_owed: number; due_date: string; days_overdue: number }>> {
  return http(withQuery(`/api/overdue-invoices`, query));
}
export async function getStudents(query?: Record<string, string | number | boolean | undefined>): Promise<Student[]> {
  return http(withQuery(`/api/students`, query));
}
export async function createStudent(input: StudentInput): Promise<Student> {
  return http(`/api/students`, { method: 'POST', body: JSON.stringify(input) });
}
export async function getStudentById(studentId: string, query?: Record<string, string | number | boolean | undefined>): Promise<Student> {
  return http(withQuery(`/api/students/${studentId}`, query));
}
export async function updateStudent(studentId: string, input: StudentInput): Promise<Student> {
  return http(`/api/students/${studentId}`, { method: 'PATCH', body: JSON.stringify(input) });
}
export async function deleteStudent(studentId: string): Promise<void> {
  return http(`/api/students/${studentId}`, { method: 'DELETE' });
}
export async function getInvoices(query?: Record<string, string | number | boolean | undefined>): Promise<Invoice[]> {
  return http(withQuery(`/api/invoices`, query));
}
export async function createInvoiceGenerate(input: { billing_month: string; issued_date: string; due_date: string }): Promise<{ created: number; skipped: number }> {
  return http(`/api/invoices/generate`, { method: 'POST', body: JSON.stringify(input) });
}
export async function getInvoiceById(invoiceId: string, query?: Record<string, string | number | boolean | undefined>): Promise<Invoice & { student_name: string; days_overdue: number }> {
  return http(withQuery(`/api/invoices/${invoiceId}`, query));
}
export async function updateInvoice(invoiceId: string, input: InvoiceInput): Promise<Invoice> {
  return http(`/api/invoices/${invoiceId}`, { method: 'PATCH', body: JSON.stringify(input) });
}
export async function deleteInvoice(invoiceId: string): Promise<void> {
  return http(`/api/invoices/${invoiceId}`, { method: 'DELETE' });
}
export async function createInvoiceMarkPaid(invoiceId: string, input: { paid_at: string; paid_amount: number }): Promise<Invoice> {
  return http(`/api/invoices/${invoiceId}/mark-paid`, { method: 'POST', body: JSON.stringify(input) });
}
export async function createInvoiceAlert(invoiceId: string, input: { alert_date?: string }): Promise<any> {
  return http(`/api/invoices/${invoiceId}/alerts`, { method: 'POST', body: JSON.stringify(input) });
}
export async function getAlerts(query?: Record<string, string | number | boolean | undefined>): Promise<Array<{ alert_id: string; invoice_id: string; student_name: string; amount_owed: number; days_overdue: number; alert_date: string; status: string }>> {
  return http(withQuery(`/api/alerts`, query));
}
export async function getBills(query?: Record<string, string | number | boolean | undefined>): Promise<Bill[]> {
  return http(withQuery(`/api/bills`, query));
}
export async function createBill(input: BillInput): Promise<Bill> {
  return http(`/api/bills`, { method: 'POST', body: JSON.stringify(input) });
}
export async function updateBill(billId: string, input: BillInput): Promise<Bill> {
  return http(`/api/bills/${billId}`, { method: 'PATCH', body: JSON.stringify(input) });
}
export async function deleteBill(billId: string): Promise<void> {
  return http(`/api/bills/${billId}`, { method: 'DELETE' });
}
export async function getCashFlowForecast(query?: Record<string, string | number | boolean | undefined>): Promise<{ days_30: { cash_in: number; cash_out: number; net: number }; days_60: { cash_in: number; cash_out: number; net: number }; days_90: { cash_in: number; cash_out: number; net: number } }> {
  return http(withQuery(`/api/cash-flow-forecast`, query));
}
export async function getStudentWhatIf(studentId: string, query?: Record<string, string | number | boolean | undefined>): Promise<{ student_name: string; delay_days: number; shifted_amount: number; cash_in_change_30: number; cash_in_change_60: number; cash_in_change_90: number }> {
  return http(withQuery(`/api/students/${studentId}/what-if`, query));
}
export async function getBillById(billId: string, query?: Record<string, string | number | boolean | undefined>): Promise<Bill> {
  return http(withQuery(`/api/bills/${billId}`, query));
}
export async function createBillMarkPaid(billId: string, input: Record<string, unknown>): Promise<Bill> {
  return http(`/api/bills/${billId}/mark-paid`, { method: 'POST', body: JSON.stringify(input) });
}
export async function createBillMarkUnpaid(billId: string, input: Record<string, unknown>): Promise<any> {
  return http(`/api/bills/${billId}/mark-unpaid`, { method: 'POST', body: JSON.stringify(input) });
}
export async function getStudentInvoices(studentId: string, query?: Record<string, string | number | boolean | undefined>): Promise<Invoice[]> {
  return http(withQuery(`/api/students/${studentId}/invoices`, query));
}
