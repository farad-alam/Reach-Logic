// src/app/api/portal/threads/route.ts
// GET /api/portal/threads?clientId=...
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  const clientId = req.nextUrl.searchParams.get("clientId");

  try {
    let threads;

    if (role === "SUPER_ADMIN") {
      if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });
      threads = await prisma.thread.findMany({
        where: { clientId },
        include: {
          members: { include: { user: { select: { id: true, fullName: true, email: true, avatarUrl: true, role: true } } } },
          messages: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
        },
        orderBy: { createdAt: "asc" },
      });
    } else if (role === "CLIENT") {
      threads = await prisma.thread.findMany({
        where: { clientId: session.user.id },
        include: {
          members: { include: { user: { select: { id: true, fullName: true, email: true, avatarUrl: true, role: true } } } },
          messages: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
        },
        orderBy: { createdAt: "asc" },
      });
    } else if (role === "TEAM_MEMBER") {
      // Team members see only threads they're assigned to
      const memberships = await prisma.threadMember.findMany({
        where: { userId: session.user.id },
        select: { threadId: true },
      });
      const threadIds = memberships.map((m) => m.threadId);
      threads = await prisma.thread.findMany({
        where: { id: { in: threadIds }, ...(clientId ? { clientId } : {}) },
        include: {
          members: { include: { user: { select: { id: true, fullName: true, email: true, avatarUrl: true, role: true } } } },
          messages: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
        },
        orderBy: { createdAt: "asc" },
      });
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ threads });
  } catch (err) {
    console.error("[threads/list]", err);
    return NextResponse.json({ error: "Failed to fetch threads" }, { status: 500 });
  }
}
