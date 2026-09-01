import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { hashToken, issueToken, normalizeMatric } from "@/lib/security";

const createSchema = z.object({ candidateName: z.string().trim().min(3).max(120), matriculationNumber: z.string().trim().min(4).max(50), positionId: z.string().min(1), validDays: z.coerce.number().int().min(1).max(90).default(14) });
const reviewSchema = z.discriminatedUnion("action", [z.object({ action: z.literal("APPROVE") }), z.object({ action: z.literal("REJECT"), note: z.string().trim().min(5).max(1000) })]);
const slugify = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function GET(request: Request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ message: "Missing nomination id." }, { status: 400 });
  const invite = await db.nominationInvite.findUnique({ where: { id }, include: { position: true } });
  if (!invite) return NextResponse.json({ message: "Nomination not found." }, { status: 404 });
  return NextResponse.json({ ...invite, position: invite.position.title, priorities: JSON.parse(invite.priorities), tokenHash: undefined });
}

export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Enter the candidate name, matriculation number, position and validity period." }, { status: 400 });
  const matriculationNumber = normalizeMatric(parsed.data.matriculationNumber);
  const [position, candidate, activeInvite] = await Promise.all([db.position.findUnique({ where: { id: parsed.data.positionId } }), db.candidate.findFirst({ where: { matriculationNumber } }), db.nominationInvite.findFirst({ where: { matriculationNumber, status: { in: ["DRAFT", "REJECTED", "SUBMITTED"] } } })]);
  if (!position) return NextResponse.json({ message: "Position not found." }, { status: 404 });
  if (candidate) return NextResponse.json({ message: "A candidate already exists with this matriculation number." }, { status: 409 });
  if (activeInvite) return NextResponse.json({ message: "An active nomination link already exists for this matriculation number." }, { status: 409 });
  const token = issueToken();
  const invite = await db.nominationInvite.create({ data: { tokenHash: hashToken(token), candidateName: parsed.data.candidateName, matriculationNumber, positionId: position.id, expiresAt: new Date(Date.now() + parsed.data.validDays * 86400000) } });
  return NextResponse.json({ id: invite.id, link: `${new URL(request.url).origin}/nominate/${token}`, expiresAt: invite.expiresAt }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ message: "Missing nomination id." }, { status: 400 });
  const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Choose approve or provide a clear rejection reason." }, { status: 400 });
  const invite = await db.nominationInvite.findUnique({ where: { id }, include: { position: true } });
  if (!invite) return NextResponse.json({ message: "Nomination not found." }, { status: 404 });
  if (invite.status !== "SUBMITTED") return NextResponse.json({ message: "Only a submitted nomination can be reviewed." }, { status: 409 });
  if (parsed.data.action === "REJECT") {
    const minimumExpiry = new Date(Date.now() + 14 * 86400000);
    await db.nominationInvite.update({ where: { id }, data: { status: "REJECTED", reviewNote: parsed.data.note, reviewedAt: new Date(), expiresAt: invite.expiresAt > minimumExpiry ? invite.expiresAt : minimumExpiry } });
    return NextResponse.json({ ok: true, status: "REJECTED" });
  }
  const candidate = await db.$transaction(async tx => {
    const current = await tx.nominationInvite.findUnique({ where: { id } });
    if (!current || current.status !== "SUBMITTED") throw new Error("ALREADY_REVIEWED");
    const matriculationNumber = normalizeMatric(current.matriculationNumber);
    const candidateData = { positionId: current.positionId, name: current.candidateName, pka: current.pka, matriculationNumber, department: "Library & Information Science", level: current.level, photoUrl: current.passportData, tagline: current.tagline, biography: current.biography, manifesto: current.manifesto, vision: current.vision, mission: current.mission, priorities: current.priorities, verified: true };
    let existing = current.candidateId ? await tx.candidate.findUnique({ where: { id: current.candidateId } }) : await tx.candidate.findFirst({ where: { matriculationNumber } });
    if (existing) existing = await tx.candidate.update({ where: { id: existing.id }, data: candidateData });
    else {
      let slug = slugify(current.candidateName); if (await tx.candidate.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
      existing = await tx.candidate.create({ data: { ...candidateData, slug } });
    }
    await tx.nominationInvite.update({ where: { id }, data: { status: "APPROVED", candidateId: existing.id, reviewNote: "Approved by the Electoral Commission.", reviewedAt: new Date() } });
    return existing;
  }, { maxWait: 30_000, timeout: 120_000 });
  revalidatePath("/candidates"); revalidatePath("/election"); revalidatePath("/");
  return NextResponse.json({ ok: true, status: "APPROVED", candidateId: candidate.id });
}

export async function DELETE(request: Request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ message: "Missing invitation id." }, { status: 400 });
  const invite = await db.nominationInvite.findUnique({ where: { id } });
  if (!invite) return NextResponse.json({ message: "Invitation not found." }, { status: 404 });
  if (["SUBMITTED", "APPROVED"].includes(invite.status)) return NextResponse.json({ message: "A submitted or approved nomination cannot be revoked." }, { status: 409 });
  await db.nominationInvite.update({ where: { id }, data: { status: "REVOKED" } });
  return NextResponse.json({ ok: true });
}
