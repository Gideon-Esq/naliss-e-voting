import { Users } from "lucide-react";
import { CandidateDirectory } from "@/components/candidate-directory";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CandidatesPage() {
  const candidates = await db.candidate.findMany({ where: { position: { election: { status: "PUBLISHED" } } }, include: { position: { select: { title: true, slug: true } } }, orderBy: { name: "asc" } });
  return <><SiteHeader/><main className="page"><header className="page-title"><h1><Users/>Meet the Candidates</h1><p>Explore the students contesting in the NALISS 2026 departmental election. Review their manifestos and profiles before you cast your vote.</p></header><CandidateDirectory candidates={candidates}/></main><SiteFooter/></>;
}
