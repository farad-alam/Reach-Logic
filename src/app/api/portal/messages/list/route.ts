// src/app/api/portal/messages/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get("threadId");
  const since = searchParams.get("since"); // For polling optimization

  if (!threadId) {
    return NextResponse.json({ error: "threadId is required" }, { status: 400 });
  }

  try {
    // Basic auth check: verify user has access to thread
    // Super Admins have access to all. Clients have access to theirs. Team Members to assigned.
    const role = (session.user as { role?: string }).role;
    
    let hasAccess = false;
    if (role === "SUPER_ADMIN") {
      hasAccess = true;
    } else if (role === "CLIENT") {
      const thread = await prisma.thread.findUnique({ where: { id: threadId } });
      hasAccess = thread?.clientId === session.user.id;
    } else if (role === "TEAM_MEMBER") {
      const membership = await prisma.threadMember.findUnique({
        where: { threadId_userId: { threadId, userId: session.user.id } }
      });
      hasAccess = !!membership;
    }

    if (!hasAccess) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch messages. When polling (`since`), also return messages that were
    // edited or deleted after that moment so changes sync to other users.
    const whereClause: any = { threadId };
    if (since) {
      const sinceDate = new Date(since);
      whereClause.OR = [
        { createdAt: { gt: sinceDate } },
        { editedAt: { gt: sinceDate } },
        { deletedAt: { gt: sinceDate } },
      ];
    }

    const rawMessages = await prisma.message.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, fullName: true, avatarUrl: true, email: true, role: true, designation: true } },
        attachments: true,
      },
    });

    // Redact soft-deleted messages: the original text/files never reach the browser.
    const messages = rawMessages.map((m) =>
      m.deletedAt ? { ...m, body: "", attachments: [], metadata: null } : m
    );

    // Mark notifications as read for this thread if there are any
    if (messages.length > 0 && !since) {
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          type: "NEW_MESSAGE",
          isRead: false,
          link: { contains: threadId } // basic check, ideally should store threadId in notification
        },
        data: { isRead: true }
      });
    }

    return NextResponse.json({ ok: true, messages, viewerRole: role ?? null });
  } catch (error) {
    console.error("[messages/list]", error);
    return NextResponse.json({ error: "Failed to fetch messages." }, { status: 500 });
  }
}
