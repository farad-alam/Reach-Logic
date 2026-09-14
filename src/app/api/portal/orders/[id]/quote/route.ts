// src/app/api/portal/orders/[id]/quote/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notify, notifyOrderStatus } from "@/lib/notifications";

export async function POST(
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
    
    if (typeof body.amount !== "number" || body.amount <= 0) {
      return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { client: { select: { id: true, email: true, fullName: true } } }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.amount !== null) {
       return NextResponse.json({ error: "Order is already quoted." }, { status: 400 });
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        amount: body.amount,
        status: "PENDING",
      }
    });

    // Notify client
    await notify({
      userId: order.clientId,
      type: "ORDER_STATUS_CHANGED",
      title: `Quote Ready: ${order.serviceTitle}`,
      body: `Your project "${order.serviceTitle}" has been quoted for $${body.amount.toFixed(2)}. It is now Pending Start.`,
      link: `/portal/client/orders/${order.id}`,
    });

    // Auto-post to thread
    const thread = await prisma.thread.findUnique({
      where: { clientId: order.clientId }
    });

    if (thread) {
      await prisma.message.create({
        data: {
          threadId: thread.id,
          body: `Project "${order.serviceTitle}" has been quoted for $${body.amount.toFixed(2)} and is now Pending Start.`,
          type: "SYSTEM",
          metadata: { orderId: order.id, event: "order_quoted" },
        }
      });
    }

    return NextResponse.json({ ok: true, order: updatedOrder });
  } catch (error) {
    console.error("[orders/quote]", error);
    return NextResponse.json({ error: "Failed to quote order." }, { status: 500 });
  }
}
