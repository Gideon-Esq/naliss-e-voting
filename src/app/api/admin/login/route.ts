import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ADMIN_COOKIE,
  createAdminSession,
  validAdminPassword,
} from "@/lib/admin-auth";
const schema = z.object({ password: z.string().min(1).max(200) });
export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success || !validAdminPassword(parsed.data.password))
      return NextResponse.json(
        { message: "Invalid administrator credentials." },
        { status: 401 },
      );
    const session = await createAdminSession();
    (await cookies()).set(ADMIN_COOKIE, session.token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      expires: session.expiresAt,
      path: "/",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Administrator login failed.", error);
    const configurationError =
      error instanceof Error && error.message.startsWith("ADMIN_PASSWORD");
    return NextResponse.json(
      {
        message: configurationError
          ? "Administrator login is not configured. Add an ADMIN_PASSWORD of at least 12 characters to the deployment environment."
          : "Administrator login is temporarily unavailable. Check the Neon database variables and apply the Prisma schema.",
      },
      { status: 503 },
    );
  }
}
