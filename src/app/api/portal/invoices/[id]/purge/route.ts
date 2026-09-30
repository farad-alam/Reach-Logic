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

    const invoice = await prisma.invoice.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error("Invoice purge error:", error);
    return NextResponse.json({ error: "Failed to purge invoice" }, { status: 500 });
  }
}
