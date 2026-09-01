import { NominationAdmin } from "@/components/nomination-admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminNominations() {
  const election = await db.election.findFirst({ where: { status: "PUBLISHED" }, include: { positions: { orderBy: { sortOrder: "asc" } } } });
  const invitations = await db.nominationInvite.findMany({ select: { id:true,candidateName:true,matriculationNumber:true,status:true,expiresAt:true,submittedAt:true,reviewNote:true,position:{select:{title:true}} }, orderBy: { createdAt: "desc" }, take: 100 });
  return <div className="admin-content nomination-admin-page"><div className="admin-heading"><div><small>CANDIDATE NOMINATION</small><h1>Candidate Links</h1><p>Generate secure forms, review submissions, request corrections, and publish approved candidates.</p></div></div><NominationAdmin positions={election?.positions ?? []} invitations={invitations.map(item => ({ id: item.id, candidateName: item.candidateName, matriculationNumber: item.matriculationNumber, position: item.position.title, status: item.status, expiresAt: item.expiresAt.toISOString(), submittedAt: item.submittedAt?.toISOString() ?? null, reviewNote: item.reviewNote }))} /></div>;
}
