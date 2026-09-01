import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashToken, VOTING_COOKIE } from "@/lib/security";

export async function GET() {
  const token = (await cookies()).get(VOTING_COOKIE)?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });
  const session = await db.votingSession.findUnique({ where: { tokenHash: hashToken(token) }, include: { voter: { select: { displayName: true } } } });
  const authenticated = Boolean(session && !session.usedAt && session.expiresAt > new Date());
  return NextResponse.json(authenticated ? { authenticated: true, voterName: session!.voter.displayName } : { authenticated: false }, { status: authenticated ? 200 : 401 });
}
