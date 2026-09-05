import { db, withDatabaseRetry } from "@/lib/db";

export function electionState(opensAt: Date, closesAt: Date, now = new Date()) {
  if (now < opensAt) return "upcoming" as const;
  if (now > closesAt) return "closed" as const;
  return "open" as const;
}

export function formatWat(value: Date) {
  return new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Africa/Lagos", timeZoneName: "short" }).format(value);
}

export async function getPublishedElection() {
  return withDatabaseRetry(() => db.election.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { opensAt: "desc" },
    include: {
      positions: {
        orderBy: { sortOrder: "asc" },
        include: { candidates: { orderBy: { name: "asc" } } },
      },
    },
  }));
}
