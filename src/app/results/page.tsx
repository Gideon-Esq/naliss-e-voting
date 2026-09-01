import { LockKeyhole, Trophy } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { db } from "@/lib/db";
import { formatWat } from "@/lib/elections";

export const dynamic="force-dynamic";

export default async function ResultsPage(){
  const election=await db.election.findFirst({where:{status:"PUBLISHED"},include:{_count:{select:{ballots:true}},positions:{orderBy:{sortOrder:"asc"},include:{candidates:{include:{_count:{select:{votes:true}}}}}}}});
  if(!election?.resultsPublishedAt)return <><SiteHeader/><main className="page results-locked"><LockKeyhole/><h1>Results have not been published</h1><p>The Electoral Commission will publish certified results here after voting closes and verification is complete.</p></main><SiteFooter/></>;
  return <><SiteHeader/><main className="page public-results"><div className="page-title"><h1><Trophy/>Certified Election Results</h1><p>{election.title} · Published {formatWat(election.resultsPublishedAt)} · {election._count.ballots} ballots submitted</p></div><div className="public-result-grid">{election.positions.map(position=>{const ranked=[...position.candidates].sort((a,b)=>b._count.votes-a._count.votes);const total=ranked.reduce((sum,candidate)=>sum+candidate._count.votes,0);return <article key={position.id}><h2>{position.title}</h2>{ranked.map((candidate,index)=>{const votes=candidate._count.votes;const percent=total?Math.round(votes/total*100):0;return <div className={`public-result-row ${index===0&&votes>0?"winner":""}`}key={candidate.id}><span>{index===0&&votes>0?<Trophy/>:index+1}</span><div><b>{candidate.name}</b>{candidate.pka&&<small>PKA: {candidate.pka}</small>}<div className="result-bar"><i style={{width:`${percent}%`}}/></div></div><strong>{votes}<small>{percent}%</small></strong></div>})}</article>})}</div></main><SiteFooter/></>;
}
