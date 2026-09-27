import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notify } from "@/lib/notifications";

export async function POST(req: NextRequest, { params }: { params: Promise<{ threadId: string }> }) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { threadId } = await params;
  const { email } = await req.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        client: true,
        members: { include: { user: true } },
      },
    });

    if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    if (thread.clientId !== session.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const clientMembers = thread.members.filter((m) => m.user.role === "CLIENT");
    if (clientMembers.length >= 3) {
      return NextResponse.json({ error: "Maximum of 2 colleagues allowed" }, { status: 400 });
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          role: "CLIENT",
          isActive: true,
        },
      });
    } else {
      if (user.role !== "CLIENT") {
        return NextResponse.json({ error: "Cannot invite this user" }, { status: 400 });
      }
    }

    // Check if already in thread
    const alreadyIn = thread.members.find((m) => m.userId === user.id);
    if (!alreadyIn) {
      await prisma.threadMember.create({
        data: {
          threadId: thread.id,
          userId: user.id,
        },
      });

      // Send email & notification
      await notify({
        userId: user.id,
        type: "NEW_MESSAGE",
        title: "Added to conversation on ReachLogic",
        body: `${session.user.email} has added you to a conversation thread ("${thread.name}") on the ReachLogic Portal.`,
        link: "/portal/login",
      });

      // Create a system message
      await prisma.message.create({
        data: {
          threadId: thread.id,
          type: "SYSTEM",
          body: `${session.user.email} added ${email} to the thread.`,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[invite-colleague]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
