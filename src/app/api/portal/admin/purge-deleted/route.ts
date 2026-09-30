import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  // Use a secret token to prevent unauthorized access
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    // Hard delete orders older than 30 days
    const deletedOrders = await prisma.order.deleteMany({
      where: { deletedAt: { lte: cutoff } },
    });

    // Hard delete invoices older than 30 days
    const deletedInvoices = await prisma.invoice.deleteMany({
      where: { deletedAt: { lte: cutoff } },
    });

    // Hard delete users (clients) older than 30 days
    const deletedUsers = await prisma.user.deleteMany({
      where: { deletedAt: { lte: cutoff }, role: "CLIENT" },
    });

    return NextResponse.json({
      success: true,
      purged: {
        orders: deletedOrders.count,
        invoices: deletedInvoices.count,
        users: deletedUsers.count,
      },
    });
  } catch (error) {
    console.error("Purge error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
