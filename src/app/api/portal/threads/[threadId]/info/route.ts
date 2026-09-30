// src/app/api/portal/threads/[threadId]/info/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ threadId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  const { threadId } = await params;

  try {
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        client: { select: { id: true, fullName: true, email: true, avatarUrl: true, company: true, createdAt: true } },
        members: {
          include: { user: { select: { id: true, fullName: true, email: true, avatarUrl: true, role: true, designation: true } } },
        },
        orders: {
          select: { id: true, serviceTitle: true, status: true, startDate: true, endDate: true, amount: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

    // Verify access
    if (role === "CLIENT" && thread.clientId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (role === "TEAM_MEMBER") {
      const isMember = thread.members.some((m) => m.userId === session.user?.id);
      if (!isMember) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Payment totals — compute for SUPER_ADMIN and CLIENT
    let payments = null;
    if (role === "SUPER_ADMIN" || role === "CLIENT") {
      const invoices = await prisma.invoice.findMany({
        where: { clientId: thread.clientId },
        include: { lineItems: { select: { amount: true } } },
      });

      let totalBilled = 0;
      let totalPaid = 0;
      let totalDue = 0;
      for (const inv of invoices) {
        const amount = inv.lineItems.reduce((s, li) => s + Number(li.amount), 0);
        totalBilled += amount;
        if (inv.isPaid) totalPaid += amount;
        else totalDue += amount;
      }
      payments = { totalBilled, totalPaid, totalDue };
    }

    return NextResponse.json({
      thread: {
        id: thread.id,
        name: thread.name,
        client: thread.client,
        members: thread.members.map((m) => m.user),
        orders: thread.orders,
        payments, // null for non-admins
      },
    });
  } catch (err) {
    console.error("[threads/info]", err);
    return NextResponse.json({ error: "Failed to fetch thread info" }, { status: 500 });
  }
}
