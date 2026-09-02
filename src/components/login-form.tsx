"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter(); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setError(""); const data=new FormData(event.currentTarget); const response=await fetch("/api/auth/verify",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({matriculationNumber:data.get("matriculationNumber"),surname:data.get("surname")})}); const body=await response.json(); if(response.ok) router.push(body.redirectTo); else setError(body.message); setBusy(false); }
  return <form className="login-form" onSubmit={submit}><h1>Verify Your Identity</h1><div className="badges"><span>Verified Voting</span><span>Identity Protected</span></div><label>Matriculation Number<input required name="matriculationNumber" placeholder="e.g. ETL/2023/125"/></label><label>Surname<input required name="surname" placeholder="Enter your surname"/></label>{error&&<p className="error" role="alert">{error}</p>}<button className="button" disabled={busy}>{busy?"Verifying…":"Continue →"}</button><p className="notice">Your eligibility is checked securely. We never reveal whether a specific record exists.</p></form>;
}

