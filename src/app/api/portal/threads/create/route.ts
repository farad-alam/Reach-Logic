// src/app/api/portal/threads/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  clientId: z.string().min(1),
  name: z.string().min(1).max(30),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const { clientId, name } = parsed.data;

    // Verify client exists
    const client = await prisma.user.findUnique({ where: { id: clientId, role: "CLIENT" }, select: { id: true } });
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const thread = await prisma.thread.create({ data: { clientId, name: name.trim() } });

    // Auto-add all SUPER_ADMINs
    const admins = await prisma.user.findMany({ where: { role: "SUPER_ADMIN", isActive: true }, select: { id: true } });
    for (const admin of admins) {
      await prisma.threadMember.create({ data: { threadId: thread.id, userId: admin.id } });
    }

    // Fetch with members for response
    const full = await prisma.thread.findUnique({
      where: { id: thread.id },
      include: { members: { include: { user: { select: { id: true, fullName: true, email: true, avatarUrl: true, role: true } } } } },
    });

    return NextResponse.json({ ok: true, thread: full });
  } catch (err) {
    console.error("[threads/create]", err);
    return NextResponse.json({ error: "Failed to create thread" }, { status: 500 });
  }
}
