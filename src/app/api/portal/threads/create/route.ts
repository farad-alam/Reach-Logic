// src/app/api/portal/threads/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Idempotent: creates a Thread for a client if one doesn't exist, or returns the existing one.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessionUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (sessionUser?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { clientId } = await req.json();
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  const client = await prisma.user.findUnique({
    where: { id: clientId, role: "CLIENT" },
    select: { id: true },
  });
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  // Upsert: return existing thread or create a new one
  let thread = await prisma.thread.findUnique({ where: { clientId } });
  if (!thread) {
    thread = await prisma.thread.create({ data: { clientId } });
  }

  return NextResponse.json({ threadId: thread.id });
}
