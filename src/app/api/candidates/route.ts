import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const candidates = await db.candidate.findMany({
    where: { position: { election: { status: "PUBLISHED" } } },
    include: { position: { select: { title: true, slug: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(candidates);
}

