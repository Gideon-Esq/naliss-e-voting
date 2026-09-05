import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

const transientDatabaseCodes = new Set(["P1001", "P2024", "P2028"]);

function isTransientDatabaseError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const value = error as { code?: string; message?: string };
  return Boolean(
    (value.code && transientDatabaseCodes.has(value.code)) ||
    value.message?.includes("Can't reach database server") ||
    value.message?.includes("Timed out fetching a new connection"),
  );
}

export async function withDatabaseRetry<T>(operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (error) {
    if (!isTransientDatabaseError(error)) throw error;
    await new Promise(resolve => setTimeout(resolve, 500));
    return operation();
  }
}
