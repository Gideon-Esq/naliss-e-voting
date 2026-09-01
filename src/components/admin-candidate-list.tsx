"use client";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Candidate={id:string;slug:string;name:string;department:string;verified:boolean;position:{title:string}};
export function AdminCandidateList({candidates}:{candidates:Candidate[]}){const router=useRouter();async function remove(candidate:Candidate){if(!confirm(`Delete ${candidate.name}? This cannot be undone.`))return;const response=await fetch(`/api/admin/candidates?id=${encodeURIComponent(candidate.id)}`,{method:"DELETE"});const body=await response.json();if(!response.ok){alert(body.message);return}router.refresh()}return <section className="admin-card admin-table">{candidates.map(candidate=><div className="admin-row"key={candidate.id}><b>{candidate.name}</b><span>{candidate.position.title}</span><span>{candidate.department}</span><small>{candidate.verified?"Approved":"Pending"}</small><div className="row-actions"><Link href={`/candidates/${candidate.slug}`}>View</Link><Link href={`/admin/candidates/${candidate.id}/edit`}>Edit</Link><button onClick={()=>remove(candidate)}aria-label={`Delete ${candidate.name}`}><Trash2/>Delete</button></div></div>)}</section>}
