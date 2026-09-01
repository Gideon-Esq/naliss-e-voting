import { cookies } from "next/headers"; import { NextResponse } from "next/server"; import { ADMIN_COOKIE } from "@/lib/admin-auth"; import { db } from "@/lib/db"; import { hashToken } from "@/lib/security";
export async function POST(){const store=await cookies();const token=store.get(ADMIN_COOKIE)?.value;if(token)await db.adminSession.deleteMany({where:{tokenHash:hashToken(token)}});store.delete(ADMIN_COOKIE);return NextResponse.json({ok:true})}

