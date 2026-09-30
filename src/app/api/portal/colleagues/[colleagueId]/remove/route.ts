import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ colleagueId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "SUPER_ADMIN" && role !== "CLIENT") {
    // Only admins or the client who invited them should be able to remove them.
    // For now we allow super admin and client. (ClientTable is admin-only anyway).
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { colleagueId } = await params;

  try {
    // 1. Delete the ClientColleague relationship(s)
    const deletedColleagues = await prisma.clientColleague.deleteMany({
      where: { colleagueId },
    });

    if (deletedColleagues.count === 0) {
      return NextResponse.json({ error: "Colleague relationship not found" }, { status: 404 });
    }

    // 2. Remove the user from any ThreadMember associations where they are CLIENT_COLLEAGUE
    await prisma.threadMember.deleteMany({
      where: { userId: colleagueId },
    });

    // 3. Mark the user as inactive (since they are just a shell user)
    // We don't fully delete them to preserve message history (senderId)
    await prisma.user.update({
      where: { id: colleagueId },
      data: { isActive: false },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[colleagues/remove]", err);
    return NextResponse.json(
      { error: "Failed to remove colleague" },
      { status: 500 }
    );
  }
}
