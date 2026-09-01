"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export function ResultsControl({ published, canPublish }: { published: boolean; canPublish: boolean }) {
  const router=useRouter();const[busy,setBusy]=useState(false);const[message,setMessage]=useState("");
  async function update(){setBusy(true);setMessage("");const response=await fetch("/api/admin/results",{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({publish:!published})});const body=await response.json();if(response.ok){router.refresh()}else setMessage(body.message);setBusy(false)}
  return <div className="results-publish"><div><strong>{published?"Results are public":"Results are private"}</strong><p>{published?"Voters can view the certified totals on the public results page.":canPublish?"Voting has closed. Review the totals before publication.":"Publishing is available only after voting closes."}</p></div><button className={published?"button ghost":"button"}disabled={busy||(!published&&!canPublish)}onClick={update}>{published?<><EyeOff/>Unpublish Results</>:<><Eye/>Publish Results</>}</button>{message&&<p className="error">{message}</p>}</div>;
}
