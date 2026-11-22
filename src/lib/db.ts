
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const db: PrismaClient =
  globalThis.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = db;
}


const TRANSIENT_CODES = ["P1001", "P1002", "P1008", "P1017"];
const TRANSIENT_MESSAGES = ["Can't reach database server", "Closed", "timed out"];

function isTransientDbError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: unknown }).code;
  if (typeof code === "string" && TRANSIENT_CODES.includes(code)) return true;
  const message = (err as { message?: unknown }).message;
  return typeof message === "string" && TRANSIENT_MESSAGES.some((m) => message.includes(m));
}

// Retries a database operation when the failure looks like a transient
// connection error (e.g. Neon free-tier compute waking up from sleep).
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 1500
): Promise<T> {
  let lastError: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isTransientDbError(err) || i === attempts) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}