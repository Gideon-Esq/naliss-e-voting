import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { electionState } from "@/lib/elections";
import { hashToken, receiptCode } from "@/lib/security";

export type BallotSelection = { positionId: string; candidateId: string };

export class VotingError extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message);
  }
}

export async function submitBallot(rawToken: string, selections: BallotSelection[]) {
  const tokenHash = hashToken(rawToken);

  return db.$transaction(async (tx) => {
    const session = await tx.votingSession.findUnique({
      where: { tokenHash },
      include: { election: { include: { positions: { include: { candidates: true } } } } },
    });

    if (!session || session.usedAt || session.expiresAt <= new Date()) {
      throw new VotingError("SESSION_INVALID", "Your voting session has expired. Verify your identity again.", 401);
    }
    if (session.election.status !== "PUBLISHED" || electionState(session.election.opensAt, session.election.closesAt) !== "open") {
      throw new VotingError("ELECTION_NOT_OPEN", "Voting is not currently open.", 409);
    }
    if (selections.length === 0) throw new VotingError("EMPTY_BALLOT", "Choose at least one candidate.");

    const uniquePositions = new Set(selections.map((item) => item.positionId));
    if (uniquePositions.size !== selections.length) {
      throw new VotingError("DUPLICATE_POSITION", "Only one candidate may be selected per position.");
    }

    const positions = new Map(session.election.positions.map((position) => [position.id, position]));
    for (const selection of selections) {
      const position = positions.get(selection.positionId);
      if (!position || !position.candidates.some((candidate) => candidate.id === selection.candidateId)) {
        throw new VotingError("INVALID_SELECTION", "One or more ballot selections are invalid.");
      }
    }

    const existing = await tx.ballot.findUnique({
      where: { electionId_voterId: { electionId: session.electionId, voterId: session.voterId } },
    });
    if (existing) throw new VotingError("ALREADY_VOTED", "A ballot has already been submitted for this election.", 409);

    const ballot = await tx.ballot.create({
      data: {
        receipt: receiptCode(),
        electionId: session.electionId,
        voterId: session.voterId,
        votes: { create: selections },
      },
      select: { receipt: true, submittedAt: true },
    });
    await tx.votingSession.update({ where: { id: session.id }, data: { usedAt: new Date() } });
    return ballot;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

