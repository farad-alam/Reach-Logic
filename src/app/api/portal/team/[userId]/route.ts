// src/app/api/portal/team/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const patchSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(["TEAM_MEMBER", "SUPER_ADMIN"]).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId } = await params;
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input.", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const member = await prisma.user.findUnique({ where: { id: userId } });
    if (!member || member.role === "CLIENT") {
      return NextResponse.json({ error: "Team member not found." }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: parsed.data,
    });

    return NextResponse.json({ ok: true, user: { id: updated.id, isActive: updated.isActive, role: updated.role } });
  } catch (err) {
    console.error("[team/[userId] PATCH]", err);
    return NextResponse.json({ error: "Failed to update team member." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId } = await params;
    const member = await prisma.user.findUnique({
      where: { id: userId },
      include: { threadMemberships: true },
    });
    if (!member || member.role === "CLIENT") {
      return NextResponse.json({ error: "Team member not found." }, { status: 404 });
    }

    if (member.threadMemberships.length > 0) {
      // Has assignments — deactivate instead of deleting
      await prisma.user.update({ where: { id: userId }, data: { isActive: false } });
      return NextResponse.json({ ok: true, action: "deactivated" });
    }

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ ok: true, action: "deleted" });
  } catch (err) {
    console.error("[team/[userId] DELETE]", err);
    return NextResponse.json({ error: "Failed to remove team member." }, { status: 500 });
  }
}
