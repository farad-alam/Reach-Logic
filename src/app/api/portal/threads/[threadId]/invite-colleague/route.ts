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

    // Find or create the colleague user
    let user = await prisma.user.findUnique({
      where: { email },
      include: { sessions: { take: 1 } }, // check if they've ever logged in
    });
    let tempPassword = "";
    let isNewUser = false;

    if (!user) {
      // Brand new user — create account with temp password
      // New users always have 0 sessions, so no need to check
      isNewUser = true;
      tempPassword = crypto.randomBytes(4).toString("hex"); // 8-char hex
      const passwordHash = await bcrypt.hash(tempPassword, 10);
      // NOTE: do NOT use include on create — Neon HTTP mode doesn't support implicit transactions
      const newUser = await prisma.user.create({
        data: {
          email,
          fullName: name || email.split("@")[0],
          role: "CLIENT_COLLEAGUE",
          passwordHash,
          isActive: true,
        },
      });
      user = { ...newUser, sessions: [] };
    } else {
      if (user.role !== "CLIENT_COLLEAGUE") {
        return NextResponse.json({ error: "Cannot invite this user" }, { status: 400 });
      }

      // Existing CLIENT_COLLEAGUE who has never logged in (account was created but email was never received)
      // Generate a fresh temp password and re-send credentials
      const hasEverLoggedIn = user.sessions.length > 0;
      if (!hasEverLoggedIn) {
        tempPassword = crypto.randomBytes(4).toString("hex");
        const passwordHash = await bcrypt.hash(tempPassword, 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash },
        });
      }
    }

    // Create ClientColleague link if it doesn't already exist
    // (avoid upsert — Neon HTTP/pooler mode doesn't support implicit transactions)
    const existingLink = await prisma.clientColleague.findUnique({
      where: {
        clientId_colleagueId_threadId: {
          clientId: session.user.id,
          colleagueId: user.id,
          threadId: thread.id,
        },
      },
    });
    if (!existingLink) {
      await prisma.clientColleague.create({
        data: {
          clientId: session.user.id,
          colleagueId: user.id,
          threadId: thread.id,
          status: tempPassword ? "INVITED" : "ACTIVE",
        },
      });
    }

    // Add to thread if not already a member
    const alreadyIn = thread.members.find((m) => m.userId === user.id);
    if (!alreadyIn) {
      await prisma.threadMember.create({
        data: {
          threadId: thread.id,
          userId: user.id,
        },
      });

      // System message
      await prisma.message.create({
        data: {
          threadId: thread.id,
          type: "SYSTEM",
          body: `${thread.client.fullName || thread.client.email} added ${email} to the thread.`,
        },
      });
    }

    // Send credentials email if they need one (new user OR existing but never logged in)
    // Non-blocking so email failure doesn't fail the invite
    if (tempPassword) {
      sendColleagueInvitation(email, tempPassword, thread.name, thread.client.fullName || thread.client.email)
        .catch((err) => console.error("[invite-colleague] email failed (non-fatal):", err));
    } else if (!isNewUser) {
      // Existing user who has already logged in — just send an in-app notification
      await notify({
        userId: user.id,
        type: "NEW_MESSAGE",
        title: "Added to a conversation on ReachLogic",
        body: `${thread.client.fullName || thread.client.email} has added you to the "${thread.name}" thread on the ReachLogic Portal.`,
        link: `/portal/client/messages`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[invite-colleague]", err);
    return NextResponse.json({ error: err?.message ?? "Internal server error" }, { status: 500 });
  }
}
