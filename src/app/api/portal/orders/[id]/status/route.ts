// src/app/api/portal/orders/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyOrderStatus } from "@/lib/notifications";
import { lockOrderInvoices } from "@/lib/invoices";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;
    
    if (!["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { client: { select: { id: true } } }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.status === "AWAITING_QUOTE") {
       return NextResponse.json({ error: "Cannot change status until quote is set." }, { status: 400 });
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });

    // Notify client
    await notifyOrderStatus(order.id, status);

    // Auto-post to thread
    const thread = await prisma.thread.findUnique({
      where: { clientId: order.clientId }
    });

    if (thread) {
      const statusLabels: Record<string, string> = {
        PENDING: "Pending Start",
        IN_PROGRESS: "In Progress",
        COMPLETED: "Completed",
        CANCELLED: "Cancelled",
      };
      
      await prisma.message.create({
        data: {
          threadId: thread.id,
          body: `Project "${order.serviceTitle}" status changed to ${statusLabels[status]}.`,
          type: "SYSTEM",
          metadata: { orderId: order.id, event: "status_change", newStatus: status },
        }
      });
    }

    // Lock invoices if completed or cancelled
    if (status === "COMPLETED" || status === "CANCELLED") {
      await lockOrderInvoices(order.id);
    }

    return NextResponse.json({ ok: true, order: updatedOrder });
  } catch (error) {
    console.error("[orders/status]", error);
    return NextResponse.json({ error: "Failed to update order status." }, { status: 500 });
  }
}
