import Link from "next/link";
export default async function SuccessPage({searchParams}:{searchParams:Promise<{receipt?:string}>}){const {receipt}=await searchParams;return <main className="success"><div><h1>Ballot submitted</h1><p>Your vote has been recorded. Keep this non-identifying receipt for your records.</p><code>{receipt??"Receipt unavailable"}</code><Link className="button" href="/">Return home</Link></div></main>}

