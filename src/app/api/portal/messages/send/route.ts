// src/app/api/portal/messages/send/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyNewMessage } from "@/lib/notifications";
import { canAccessThread } from "@/lib/thread-access";
import { z } from "zod";

const schema = z.object({
  threadId: z.string().min(1),
  body: z.string().min(1).max(5000),
  attachments: z
    .array(
      z.object({
        fileName: z.string(),
        fileSize: z.number(),
        cloudinaryPublicId: z.string(),
        cloudinaryUrl: z.string(),
      })
    )
    .optional(),
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

    const { threadId, body, attachments } = parsed.data;

    // Verify access (Super Admin, Client, Team Member, or Client Colleague who is a thread member)
    const role = (session.user as { role?: string }).role;
    const hasAccess = await canAccessThread(session.user.id, role, threadId);

    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create message WITHOUT nested include (avoids implicit transaction on Neon HTTP)
    const message = await prisma.message.create({
      data: {
        threadId,
        senderId: session.user.id,
        body: body.trim(),
        type: "USER",
      },
    });

    // Insert attachments one by one
    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        await prisma.attachment.create({
          data: {
            messageId: message.id,
            fileName: att.fileName,
            fileSize: att.fileSize,
            cloudinaryPublicId: att.cloudinaryPublicId,
            cloudinaryUrl: att.cloudinaryUrl,
          },
        });
      }
    }

    // Fetch sender separately
    const sender = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, fullName: true, avatarUrl: true, email: true },
    });

    // Fetch saved attachments
    const savedAttachments = await prisma.attachment.findMany({
      where: { messageId: message.id },
    });

    // Notify other participants (best-effort)
    notifyNewMessage(threadId, session.user.id, body.trim()).catch((err) =>
      console.error("[messages/send] notify failed (non-fatal):", err)
    );

    return NextResponse.json({ ok: true, message: { ...message, sender, attachments: savedAttachments } });
  } catch (error) {
    console.error("[messages/send]", error);
    const msg = error instanceof Error ? error.message : "Failed to send message.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
