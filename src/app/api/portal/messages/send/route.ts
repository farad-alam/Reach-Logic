// src/app/api/portal/messages/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyNewMessage } from "@/lib/notifications";
import { z } from "zod";

const schema = z.object({
  threadId: z.string().min(1),
  body: z.string().min(1).max(5000),
  // attachments: will add later if needed
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    const { threadId, body } = parsed.data;

    // Verify access
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

    const message = await prisma.message.create({
      data: {
        threadId,
        senderId: session.user.id,
        body: body.trim(),
        type: "USER",
      },
      include: {
        sender: { select: { id: true, fullName: true, avatarUrl: true, email: true } },
      }
    });

    // Notify other participants (best-effort — don't let email failure crash the send)
    notifyNewMessage(threadId, session.user.id, body.trim()).catch((err) =>
      console.error("[messages/send] notify failed (non-fatal):", err)
    );

    return NextResponse.json({ ok: true, message });
  } catch (error) {
    console.error("[messages/send]", error);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
