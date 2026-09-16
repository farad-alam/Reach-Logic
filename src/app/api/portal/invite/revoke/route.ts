// src/app/api/portal/invite/revoke/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({ inviteId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

    const invite = await prisma.invitation.findUnique({ where: { id: parsed.data.inviteId } });
    if (!invite) return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
    if (invite.acceptedAt) return NextResponse.json({ error: "Already accepted." }, { status: 400 });

    await prisma.invitation.update({
      where: { id: parsed.data.inviteId },
      data: { expiresAt: new Date() }, // expire immediately = revoke
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[invite/revoke]", err);
    return NextResponse.json({ error: "Failed to revoke invitation." }, { status: 500 });
  }
}
