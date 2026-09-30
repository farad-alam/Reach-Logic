import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const user = await prisma.user.update({
      where: { id },
      data: { deletedAt: null, isActive: true },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Client restore error:", error);
    return NextResponse.json({ error: "Failed to restore client" }, { status: 500 });
  }
}
