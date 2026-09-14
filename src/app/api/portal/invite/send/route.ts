// src/app/api/portal/invite/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendClientInvitation, sendTeamInvitation } from "@/lib/invitations";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  role: z.enum(["CLIENT", "TEAM_MEMBER"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user as {role?:string}).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

    const { email, role } = parsed.data;
    const result = role === "CLIENT"
      ? await sendClientInvitation(email, session.user.id)
      : await sendTeamInvitation(email, session.user.id);

    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[invite/send]", err);
    return NextResponse.json({ error: "Failed to send invitation." }, { status: 500 });
  }
}
