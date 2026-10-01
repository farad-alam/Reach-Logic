import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        deletedAt: null,
        invoiceStatus: { in: ["VOID", "SYSTEM_GLITCH", "REFUNDED", "PARTIALLY_REFUNDED"] },
      },
      orderBy: { actionDate: "desc" },
      include: {
        client: { select: { fullName: true, email: true } },
        order: { select: { serviceTitle: true } },
        lineItems: true,
      },
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("[invoices/rvg]", error);
    return NextResponse.json({ error: "Failed to fetch RVG invoices." }, { status: 500 });
  }
}
