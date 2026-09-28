import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notify } from "@/lib/notifications";

export async function POST(req: NextRequest, { params }: { params: Promise<{ threadId: string }> }) {
  const session = await auth();
  
  if (!session?.user?.id || (session.user as any).role !== "SUPER_ADMIN") {
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
        members: { include: { user: true } },
      },
    });

    if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

    // Ensure the invited user is actually a team member or admin
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found. Team members must be created in the Team tab first." }, { status: 404 });
    }
    
    if (user.role !== "TEAM_MEMBER" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Cannot invite this user as a team member" }, { status: 400 });
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

      // Send notification to the newly added team member
      await notify({
        userId: user.id,
        type: "NEW_MESSAGE",
        title: "Assigned to a client conversation",
        body: `${session.user.email} has added you to the thread "${thread.name}".`,
        link: "/portal/login",
      });

      // Create a system message
      await prisma.message.create({
        data: {
          threadId: thread.id,
          type: "SYSTEM",
          body: `${session.user.email} added ${user.fullName || user.email} to the thread.`,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[add-team-member]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
