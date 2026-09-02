-- CreateEnum
CREATE TYPE "ElectionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "NominationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REJECTED', 'APPROVED', 'REVOKED');

-- CreateTable
CREATE TABLE "Election" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "opensAt" TIMESTAMP(3) NOT NULL,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "status" "ElectionStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "showCountdown" BOOLEAN NOT NULL DEFAULT true,
    "resultsPublishedAt" TIMESTAMP(3),

    CONSTRAINT "Election_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "maxChoices" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pka" TEXT NOT NULL DEFAULT '',
    "matriculationNumber" TEXT,
    "department" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "photoUrl" TEXT,
    "tagline" TEXT NOT NULL,
    "biography" TEXT NOT NULL,
    "manifesto" TEXT NOT NULL,
    "vision" TEXT NOT NULL,
    "mission" TEXT NOT NULL,
    "priorities" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NominationInvite" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "candidateName" TEXT NOT NULL,
    "matriculationNumber" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "NominationStatus" NOT NULL DEFAULT 'DRAFT',
    "showCountdown" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT NOT NULL DEFAULT '',
    "level" TEXT NOT NULL DEFAULT '',
    "cgpa" TEXT NOT NULL DEFAULT '',
    "permanentAddress" TEXT NOT NULL DEFAULT '',
    "pka" TEXT NOT NULL DEFAULT '',
    "tagline" TEXT NOT NULL DEFAULT '',
    "biography" TEXT NOT NULL DEFAULT '',
    "manifesto" TEXT NOT NULL DEFAULT '',
    "mission" TEXT NOT NULL DEFAULT '',
    "vision" TEXT NOT NULL DEFAULT '',
    "priorities" TEXT NOT NULL DEFAULT '[]',
    "passportData" TEXT,
    "passportName" TEXT,
    "studentIdData" TEXT,
    "studentIdName" TEXT,
    "transcriptData" TEXT,
    "transcriptName" TEXT,
    "signatureData" TEXT,
    "signatureName" TEXT,
    "declarationsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "candidateId" TEXT,
    "receipt" TEXT,
    "reviewNote" TEXT NOT NULL DEFAULT '',
    "reviewedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NominationInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voter" (
    "id" TEXT NOT NULL,
    "matriculationNumber" TEXT NOT NULL,
    "surnameNormalizedHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "eligible" BOOLEAN NOT NULL DEFAULT true,
    "department" TEXT NOT NULL DEFAULT '',
    "level" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Voter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VotingSession" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VotingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ballot" (
    "id" TEXT NOT NULL,
    "receipt" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ballot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "ballotId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "electionId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Announcement',
    "featuredImage" TEXT,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Election_slug_key" ON "Election"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Position_electionId_slug_key" ON "Position"("electionId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Position_electionId_sortOrder_key" ON "Position"("electionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_slug_key" ON "Candidate"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "NominationInvite_tokenHash_key" ON "NominationInvite"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "NominationInvite_candidateId_key" ON "NominationInvite"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "NominationInvite_receipt_key" ON "NominationInvite"("receipt");

-- CreateIndex
CREATE INDEX "NominationInvite_matriculationNumber_status_idx" ON "NominationInvite"("matriculationNumber", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Voter_matriculationNumber_key" ON "Voter"("matriculationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "VotingSession_tokenHash_key" ON "VotingSession"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "Ballot_receipt_key" ON "Ballot"("receipt");

-- CreateIndex
CREATE UNIQUE INDEX "Ballot_electionId_voterId_key" ON "Ballot"("electionId", "voterId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_ballotId_positionId_key" ON "Vote"("ballotId", "positionId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NominationInvite" ADD CONSTRAINT "NominationInvite_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingSession" ADD CONSTRAINT "VotingSession_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "Voter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotingSession" ADD CONSTRAINT "VotingSession_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ballot" ADD CONSTRAINT "Ballot_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ballot" ADD CONSTRAINT "Ballot_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "Voter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_ballotId_fkey" FOREIGN KEY ("ballotId") REFERENCES "Ballot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;
