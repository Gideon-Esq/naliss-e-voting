import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { VOTING_COOKIE } from "@/lib/security";
import { submitBallot, VotingError } from "@/lib/voting";

const ballotSchema = z.object({
  selections: z.array(z.object({ positionId: z.string().min(1), candidateId: z.string().min(1) })).min(1).max(30),
});

export async function POST(request: Request) {
  const token = (await cookies()).get(VOTING_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: "Verify your identity before voting." }, { status: 401 });
  const parsed = ballotSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "The submitted ballot is invalid." }, { status: 400 });

  try {
    const ballot = await submitBallot(token, parsed.data.selections);
    (await cookies()).delete(VOTING_COOKIE);
    return NextResponse.json(ballot, { status: 201 });
  } catch (error) {
    if (error instanceof VotingError) return NextResponse.json({ message: error.message, code: error.code }, { status: error.status });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "A ballot has already been submitted for this election.", code: "ALREADY_VOTED" }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && ["P1001", "P2024", "P2028"].includes(error.code)) {
      return NextResponse.json({ message: "The voting database is temporarily busy. Your ballot was not submitted; please try again.", code: "DATABASE_BUSY" }, { status: 503 });
    }
    throw error;
  }
}
