import { NextResponse } from "next/server";
import { getPublishedElection, electionState } from "@/lib/elections";

export async function GET() {
  const election = await getPublishedElection();
  if (!election) return NextResponse.json({ message: "No published election." }, { status: 404 });
  return NextResponse.json({ ...election, state: electionState(election.opensAt, election.closesAt) });
}

