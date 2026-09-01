import { NominationPortal } from "@/components/nomination-portal";

export default async function NominationPage({ params }: { params: Promise<{ token: string }> }) { const { token } = await params; return <NominationPortal token={token}/>; }
