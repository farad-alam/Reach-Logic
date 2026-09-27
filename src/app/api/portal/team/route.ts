// src/app/api/portal/team/route.ts — GET list of team members
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const members = await prisma.user.findMany({
    where: { role: "TEAM_MEMBER", isActive: true },
    select: { id: true, fullName: true, email: true, avatarUrl: true, role: true },
    orderBy: { fullName: "asc" },
  });

  return NextResponse.json({ members });
}
