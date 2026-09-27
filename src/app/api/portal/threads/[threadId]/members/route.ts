// src/app/api/portal/threads/[threadId]/members/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const addSchema = z.object({ userId: z.string().min(1) });

// POST — add a team member
export async function POST(req: NextRequest, { params }: { params: Promise<{ threadId: string }> }) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { threadId } = await params;
  try {
    const body = await req.json();
    const parsed = addSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const { userId } = parsed.data;

    // Check thread exists
    const thread = await prisma.thread.findUnique({ where: { id: threadId } });
    if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

    // Upsert membership
    await prisma.threadMember.upsert({
      where: { threadId_userId: { threadId, userId } },
      update: {},
      create: { threadId, userId },
    });

    const member = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, email: true, avatarUrl: true, role: true },
    });
    return NextResponse.json({ ok: true, member });
  } catch (err) {
    console.error("[threads/members/add]", err);
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
  }
}

// DELETE — remove a team member
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ threadId: string }> }) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { threadId } = await params;
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    // Don't allow removing SUPER_ADMINs
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (user?.role === "SUPER_ADMIN") {
      return NextResponse.json({ error: "Cannot remove Super Admin from a thread" }, { status: 400 });
    }

    await prisma.threadMember.delete({ where: { threadId_userId: { threadId, userId } } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[threads/members/remove]", err);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
