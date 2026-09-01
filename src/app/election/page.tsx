import Link from "next/link";
import { Countdown } from "@/components/countdown";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { electionState, getPublishedElection } from "@/lib/elections";

export const dynamic = "force-dynamic";

export default async function ElectionPage() {
  const election = await getPublishedElection(); if (!election) return <><SiteHeader/><main className="page"><h1>No published election</h1></main></>;
  const state = electionState(election.opensAt, election.closesAt);
  return <><SiteHeader/><main className="page"><section className="election-head"><div><h1>{election.title} <span className={`status ${state}`}>{state}</span></h1><p>{election.description} Review the positions below and prepare to make your voice heard.</p><strong>Verified Voting — One Eligible Voter, One Vote</strong></div><Countdown target={(state === "upcoming" ? election.opensAt : election.closesAt).toISOString()} label={state === "upcoming" ? "VOTING OPENS IN" : "VOTING CLOSES IN"}/></section><section><h2>Available Positions</h2><p>Explore the offices being contested and view the candidates for each.</p><div className="position-grid">{election.positions.map(position => <article key={position.id}><span>{position.candidates.length} candidates</span><h2>{position.title}</h2><p>{position.description}</p><Link href={`/candidates?position=${position.slug}`}>View Candidates →</Link></article>)}</div></section></main><SiteFooter/></>;
}
