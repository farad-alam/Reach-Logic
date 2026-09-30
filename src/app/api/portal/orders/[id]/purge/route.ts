import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const order = await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Order purge error:", error);
    return NextResponse.json({ error: "Failed to purge order" }, { status: 500 });
  }
}
