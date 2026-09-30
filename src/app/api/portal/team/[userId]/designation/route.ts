import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId } = await params;
    const body = await req.json();

    const user = await prisma.user.update({
      where: { id: userId },
      data: { designation: body.designation || null },
    });

    return NextResponse.json({ success: true, designation: user.designation });
  } catch (error) {
    console.error("Designation update error:", error);
    return NextResponse.json({ error: "Failed to update designation" }, { status: 500 });
  }
}
