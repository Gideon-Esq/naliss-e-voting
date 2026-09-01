import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  return NextResponse.json(await db.announcement.findMany({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" } }));
}
