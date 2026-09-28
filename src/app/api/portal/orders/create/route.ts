// src/app/api/portal/orders/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { notify } from "@/lib/notifications";
import { createAutoInvoice } from "@/lib/invoices";
import { notifyInvoiceCreated } from "@/lib/notifications";

const schema = z.object({
  serviceTitle: z.string().min(1, "Service title is required").max(150),
  description: z.string().min(1, "Description is required").max(3000),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid start date" }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid end date" }),
  billingStreet: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingZip: z.string().optional(),
  billingCountry: z.string().optional(),
  clientId: z.string().min(1).optional(), // only used by SUPER_ADMIN
  threadId: z.string().optional(),
  amount: z.string().optional(),
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
      const message = parsed.error.issues[0]?.message || "Invalid data provided.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const {
      serviceTitle,
      description,
      startDate,
      endDate,
      billingStreet,
      billingCity,
      billingState,
      billingZip,
      billingCountry,
      clientId: bodyClientId,
      threadId,
      amount,
    } = parsed.data;

    // For clients, require billing address
    if (role === "CLIENT") {
      if (!billingStreet?.trim()) return NextResponse.json({ error: "Street address is required." }, { status: 400 });
      if (!billingCity?.trim()) return NextResponse.json({ error: "City is required." }, { status: 400 });
      if (!billingState?.trim()) return NextResponse.json({ error: "State is required." }, { status: 400 });
      if (!billingZip?.trim()) return NextResponse.json({ error: "Zip code is required." }, { status: 400 });
      if (!billingCountry?.trim()) return NextResponse.json({ error: "Country is required." }, { status: 400 });
    }

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
        billingStreet: billingStreet?.trim() || null,
        billingCity: billingCity?.trim() || null,
        billingState: billingState?.trim() || null,
        billingZip: billingZip?.trim() || null,
        billingCountry: billingCountry?.trim() || null,
        clientId,
        createdById: session.user.id,
        status: (amount && role === "SUPER_ADMIN") ? "PENDING" : "AWAITING_QUOTE",
        amount: amount ? Number(amount) : null,
        threadId: threadId || null,
      },
    });

    // Fetch client separately (avoid implicit transaction from nested include)
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: { fullName: true, email: true, company: true },
    });

    // Auto-create invoice for the new order
    try {
      const invoiceId = await createAutoInvoice({
        orderId: order.id,
        clientId,
        serviceTitle: order.serviceTitle,
        amount: order.amount ? Number(order.amount) : null,
        billingName: client?.fullName,
        billingEmail: client?.email,
        billingCompany: client?.company,
        billingStreet: order.billingStreet,
        billingCity: order.billingCity,
        billingState: order.billingState,
        billingZip: order.billingZip,
        billingCountry: order.billingCountry,
      });
      // Notify client about new invoice (non-blocking)
      notifyInvoiceCreated(invoiceId).catch((err) =>
        console.error("[orders/create] invoice notify failed:", err)
      );
    } catch (invErr) {
      // Invoice creation failure is non-fatal — order still succeeds
      console.error("[orders/create] auto-invoice failed (non-fatal):", invErr);
    }

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
        body: `${client?.fullName || client?.email || "A client"} submitted a new project: "${order.serviceTitle}". Needs a quote.`,
        link: `/portal/admin/orders/${order.id}`,
      });
    }

    // Auto-post to the thread linked to the order (or General thread fallback)
    const thread = order.threadId
      ? await prisma.thread.findUnique({ where: { id: order.threadId } })
      : await prisma.thread.findFirst({ where: { clientId, name: "General" } })
        ?? await prisma.thread.findFirst({ where: { clientId } });

    if (thread) {
      await prisma.message.create({
        data: {
          threadId: thread.id,
          body: `📋 New order requested: "${order.serviceTitle}"`,
          type: "SYSTEM",
          metadata: { orderId: order.id, event: "order_created" },
        }
      });
    }

    return NextResponse.json({ ok: true, orderId: order.id });
  } catch (error) {
    console.error("[orders/create]", error);
    const msg = error instanceof Error ? error.message : "Failed to create order.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
