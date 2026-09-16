// src/app/api/portal/invite/resend/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendClientInvitation, sendTeamInvitation } from "@/lib/invitations";
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

    // Expire the old one and send a fresh invite (sendClientInvitation/sendTeamInvitation already handles expiry)
    const result = invite.role === "CLIENT"
      ? await sendClientInvitation(invite.email, session.user.id)
      : await sendTeamInvitation(invite.email, session.user.id);

    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[invite/resend]", err);
    return NextResponse.json({ error: "Failed to resend invitation." }, { status: 500 });
  }
}
