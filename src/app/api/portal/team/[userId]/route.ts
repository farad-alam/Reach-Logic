// src/app/api/portal/team/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessionUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (sessionUser?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;

  // Safety: can't deactivate self
  if (userId === session.user.id) {
    return NextResponse.json({ error: "Cannot deactivate yourself" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (target.role !== "TEAM_MEMBER") {
    return NextResponse.json({ error: "Can only deactivate team members" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
}
