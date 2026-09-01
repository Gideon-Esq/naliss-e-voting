import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { hashSurname, normalizeMatric } from "@/lib/security";

const createSchema=z.object({displayName:z.string().trim().min(3).max(150),matriculationNumber:z.string().trim().min(4).max(50),surname:z.string().trim().min(2).max(80),department:z.string().trim().max(120).default(""),level:z.string().trim().max(50).default(""),eligible:z.boolean().default(true)});
const updateSchema=createSchema.partial().extend({id:z.string().min(1),surname:z.string().trim().max(80).optional()});

export async function POST(request:Request){
  if(!await isAdminAuthenticated())return NextResponse.json({message:"Unauthorized"},{status:401});
  const parsed=createSchema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({message:"Enter full name, matriculation number and surname."},{status:400});
  const matriculationNumber=normalizeMatric(parsed.data.matriculationNumber);if(await db.voter.findUnique({where:{matriculationNumber}}))return NextResponse.json({message:"An electorate already exists with this matriculation number."},{status:409});
  const voter=await db.voter.create({data:{matriculationNumber,displayName:parsed.data.displayName,surnameNormalizedHash:hashSurname(parsed.data.surname),department:parsed.data.department,level:parsed.data.level,eligible:parsed.data.eligible}});return NextResponse.json(voter,{status:201});
}

export async function PATCH(request:Request){
  if(!await isAdminAuthenticated())return NextResponse.json({message:"Unauthorized"},{status:401});
  const parsed=updateSchema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({message:"The electorate information is invalid."},{status:400});
  const existing=await db.voter.findUnique({where:{id:parsed.data.id}});if(!existing)return NextResponse.json({message:"Electorate not found."},{status:404});
  const matriculationNumber=parsed.data.matriculationNumber?normalizeMatric(parsed.data.matriculationNumber):undefined;if(matriculationNumber){const duplicate=await db.voter.findFirst({where:{matriculationNumber,id:{not:parsed.data.id}}});if(duplicate)return NextResponse.json({message:"Another electorate already uses this matriculation number."},{status:409})}
  const voter=await db.voter.update({where:{id:parsed.data.id},data:{displayName:parsed.data.displayName,matriculationNumber,department:parsed.data.department,level:parsed.data.level,eligible:parsed.data.eligible,...(parsed.data.surname?{surnameNormalizedHash:hashSurname(parsed.data.surname)}:{})}});return NextResponse.json(voter);
}

export async function DELETE(request: Request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ message: "Missing electorate id." }, { status: 400 });
  const voter = await db.voter.findUnique({ where: { id }, select: { id: true, ballots: { select: { id: true }, take: 1 } } });
  if (!voter) return NextResponse.json({ message: "Electorate not found." }, { status: 404 });
  if (voter.ballots.length) { await db.voter.update({where:{id},data:{eligible:false}});return NextResponse.json({ok:true,disabled:true,message:"This electorate has a submitted ballot, so the account was disabled while its ballot was preserved."}) }
  await db.voter.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
