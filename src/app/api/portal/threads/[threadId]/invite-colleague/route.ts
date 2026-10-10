import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notify } from "@/lib/notifications";
import { sendColleagueInvitation } from "@/lib/invitations";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ threadId: string }> }) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { threadId } = await params;
  const { email, name } = await req.json();

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

    const colleagueMembers = thread.members.filter((m) => m.user.role === "CLIENT_COLLEAGUE");
    if (colleagueMembers.length >= 2) {
      return NextResponse.json({ error: "Maximum of 2 colleagues allowed" }, { status: 400 });
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    let tempPassword = "";

    if (!user) {
      tempPassword = crypto.randomBytes(4).toString("hex"); // 8 chars
      const passwordHash = await bcrypt.hash(tempPassword, 10);
      user = await prisma.user.create({
        data: {
          email,
          fullName: name || email.split("@")[0],
          role: "CLIENT_COLLEAGUE",
          passwordHash,
          isActive: true,
        },
      });
    } else {
      if (user.role !== "CLIENT_COLLEAGUE") {
        return NextResponse.json({ error: "Cannot invite this user" }, { status: 400 });
      }
    }

    // Upsert ClientColleague link
    await prisma.clientColleague.upsert({
      where: {
        clientId_colleagueId_threadId: {
          clientId: session.user.id,
          colleagueId: user.id,
          threadId: thread.id,
        },
      },
      update: {}, // Do nothing if it exists
      create: {
        clientId: session.user.id,
        colleagueId: user.id,
        threadId: thread.id,
        status: tempPassword ? "INVITED" : "ACTIVE", // Active if they already had an account
      },
    });

    // Check if already in thread
    const alreadyIn = thread.members.find((m) => m.userId === user.id);
    if (!alreadyIn) {
      await prisma.threadMember.create({
        data: {
          threadId: thread.id,
          userId: user.id,
        },
      });

      // Send email if new user (non-blocking — email failure should not fail the invite)
      if (tempPassword) {
        sendColleagueInvitation(email, tempPassword, thread.name, thread.client.fullName || thread.client.email)
          .catch((err) => console.error("[invite-colleague] email failed (non-fatal):", err));
      } else {
        // Send regular notification if existing user
        await notify({
          userId: user.id,
          type: "NEW_MESSAGE",
          title: "Added to conversation on ReachLogic",
          body: `${thread.client.fullName || thread.client.email} has added you to a conversation thread ("${thread.name}") on the ReachLogic Portal.`,
          link: "/portal/login",
        });
      }

      // Create a system message
      await prisma.message.create({
        data: {
          threadId: thread.id,
          type: "SYSTEM",
          body: `${thread.client.fullName || thread.client.email} added ${email} to the thread.`,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[invite-colleague]", err);
    return NextResponse.json({ error: err?.message ?? "Internal server error" }, { status: 500 });
  }
}
