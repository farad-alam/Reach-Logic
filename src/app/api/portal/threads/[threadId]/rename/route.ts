// src/app/api/portal/threads/[threadId]/rename/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({ name: z.string().min(1).max(30) });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ threadId: string }> }) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { threadId } = await params;
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Name must be 1–30 characters" }, { status: 400 });

    const thread = await prisma.thread.findUnique({ where: { id: threadId } });
    if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

    const updated = await prisma.thread.update({ where: { id: threadId }, data: { name: parsed.data.name.trim() } });
    return NextResponse.json({ ok: true, thread: updated });
  } catch (err) {
    console.error("[threads/rename]", err);
    return NextResponse.json({ error: "Failed to rename thread" }, { status: 500 });
  }
}
