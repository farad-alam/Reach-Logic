// src/app/api/portal/orders/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { notify } from "@/lib/notifications";

const schema = z.object({
  serviceTitle: z.string().min(1).max(150),
  description: z.string().min(1).max(3000),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid start date" }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid end date" }),
  clientId: z.string().cuid().optional(), // only used by SUPER_ADMIN
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const role = (session.user as { role?: string }).role;
  if (role !== "CLIENT" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data provided." }, { status: 400 });
    }

    const { serviceTitle, description, startDate, endDate, clientId: bodyClientId } = parsed.data;

    // Determine which client this order is for
    let clientId: string;
    if (role === "SUPER_ADMIN") {
      if (!bodyClientId) {
        return NextResponse.json({ error: "clientId is required for admin orders." }, { status: 400 });
      }
      // Verify the client exists
      const client = await prisma.user.findUnique({
        where: { id: bodyClientId, role: "CLIENT" },
        select: { id: true },
      });
      if (!client) {
        return NextResponse.json({ error: "Client not found." }, { status: 404 });
      }
      clientId = bodyClientId;
    } else {
      clientId = session.user.id;
    }

    const order = await prisma.order.create({
      data: {
        serviceTitle: serviceTitle.trim(),
        description: description.trim(),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        clientId,
        createdById: session.user.id,
        status: "AWAITING_QUOTE",
      },
      include: { client: true },
    });

    // Find super admins to notify
    const admins = await prisma.user.findMany({
      where: { role: "SUPER_ADMIN", isActive: true },
      select: { id: true },
    });

    // Notify admins
    for (const admin of admins) {
      await notify({
        userId: admin.id,
        type: "ORDER_CREATED",
        title: "New Project Request",
        body: `${order.client.fullName || order.client.email} submitted a new project: "${order.serviceTitle}". Needs a quote.`,
        link: `/portal/admin/orders/${order.id}`,
      });
    }

    // Auto-post to thread
    const thread = await prisma.thread.findUnique({
      where: { clientId: session.user.id }
    });

    if (thread) {
      await prisma.message.create({
        data: {
          threadId: thread.id,
          body: `New project requested: "${order.serviceTitle}". Status: Awaiting Quote.`,
          type: "SYSTEM",
          metadata: { orderId: order.id, event: "order_created" },
        }
      });
    }

    return NextResponse.json({ ok: true, orderId: order.id });
  } catch (error) {
    console.error("[orders/create]", error);
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
  }
}
