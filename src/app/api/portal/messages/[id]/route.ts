// src/app/api/portal/messages/[id]/route.ts
// PATCH  → edit own text message (within edit window)
// DELETE → soft-delete ("delete for everyone"); sender within window, or Super Admin anytime
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canAccessThread } from "@/lib/thread-access";
import { canEditMessage, canDeleteMessage } from "@/lib/message-rules";

const editSchema = z.object({ body: z.string().trim().min(1).max(5000) });

async function loadAndAuthorize(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } as const;
  }
  const userId = session.user.id;
  const role = (session.user as { role?: string }).role;

  const message = await prisma.message.findUnique({ where: { id } });
  if (!message) {
    return { error: NextResponse.json({ error: "Message not found." }, { status: 404 }) } as const;
  }

  const hasAccess = await canAccessThread(userId, role, message.threadId);
  if (!hasAccess) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 403 }) } as const;
  }
  return { userId, role, message } as const;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await loadAndAuthorize(id);
    if ("error" in ctx) return ctx.error;
    const { userId, message } = ctx;

    const parsed = editSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    if (message.deletedAt) {
      return NextResponse.json({ error: "This message was deleted." }, { status: 409 });
    }
    if (message.type !== "USER" || message.senderId !== userId) {
      return NextResponse.json({ error: "You can only edit your own messages." }, { status: 403 });
    }
    if (!canEditMessage(message, userId)) {
      return NextResponse.json(
        { error: "Edit window has expired (15 minutes) or this message can't be edited." },
        { status: 400 }
      );
    }

    if (parsed.data.body === message.body) {
      return NextResponse.json({ ok: true, message });
    }

    const updated = await prisma.message.update({
      where: { id },
      data: { body: parsed.data.body, editedAt: new Date() },
    });
    return NextResponse.json({ ok: true, message: updated });
  } catch (error) {
    console.error("[messages/edit]", error);
    return NextResponse.json({ error: "Failed to edit message." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await loadAndAuthorize(id);
    if ("error" in ctx) return ctx.error;
    const { userId, role, message } = ctx;

    if (message.deletedAt) {
      return NextResponse.json({ error: "Message already deleted." }, { status: 409 });
    }
    if (message.type !== "USER") {
      return NextResponse.json({ error: "System messages can't be deleted." }, { status: 403 });
    }
    if (!canDeleteMessage(message, userId, role)) {
      const own = message.senderId === userId;
      return NextResponse.json(
        { error: own ? "Delete window has expired (48 hours)." : "You can only delete your own messages." },
        { status: own ? 400 : 403 }
      );
    }

    // Soft delete only — row, body and attachments stay in the DB for audit/recovery.
    const deleted = await prisma.message.update({
      where: { id },
      data: { deletedAt: new Date(), deletedById: userId },
      select: { id: true, deletedAt: true, deletedById: true },
    });
    return NextResponse.json({ ok: true, ...deleted });
  } catch (error) {
    console.error("[messages/delete]", error);
    return NextResponse.json({ error: "Failed to delete message." }, { status: 500 });
  }
}
