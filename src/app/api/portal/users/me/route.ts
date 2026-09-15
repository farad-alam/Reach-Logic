// src/app/api/portal/users/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { fullName, avatarUrl, currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Password change requested
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Current password is required" }, { status: 400 });
    }
    if (!user.passwordHash) {
      return NextResponse.json({ error: "No password set on this account" }, { status: 400 });
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (fullName !== undefined) updateData.fullName = fullName;
  if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
  if (newPassword) updateData.passwordHash = await bcrypt.hash(newPassword, 12);

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: { id: true, fullName: true, email: true, avatarUrl: true, role: true },
  });

  return NextResponse.json({ user: updated });
}
