// src/app/api/portal/invoices/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getNextInvoiceNumber } from "@/lib/invoices";
import { notifyInvoiceCreated } from "@/lib/notifications";

const schema = z.object({
  clientId: z.string().min(1),
  orderId: z.string().min(1),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid due date" }),
  notes: z.string().optional(),
  lineItems: z.array(
    z.object({
      description: z.string().min(1),
      quantity: z.number().positive(),
      rate: z.number().min(0),
    })
  ).min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data provided." }, { status: 400 });
    }

    const { clientId, orderId, dueDate, notes, lineItems } = parsed.data;

    // Verify order exists and belongs to client
    const order = await prisma.order.findFirst({
      where: { id: orderId, clientId },
    });
    if (!order) {
      return NextResponse.json({ error: "Invalid project selected." }, { status: 400 });
    }

    const invoiceNumber = await getNextInvoiceNumber();

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        dueDate: new Date(dueDate),
        notes: notes?.trim() || null,
        clientId,
        orderId,
        isLocked: order.status === "COMPLETED" || order.status === "CANCELLED",
        lineItems: {
          create: lineItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate,
          })),
        },
      },
    });

    // Notify client
    await notifyInvoiceCreated(invoice.id);

    // Auto-post to thread
    const thread = await prisma.thread.findUnique({
      where: { clientId }
    });

    if (thread) {
      await prisma.message.create({
        data: {
          threadId: thread.id,
          body: `New invoice created: ${invoiceNumber}.`,
          type: "SYSTEM",
          metadata: { invoiceId: invoice.id, orderId: order.id, event: "invoice_created" },
        }
      });
    }

    return NextResponse.json({ ok: true, invoiceId: invoice.id });
  } catch (error) {
    console.error("[invoices/create]", error);
    return NextResponse.json({ error: "Failed to create invoice." }, { status: 500 });
  }
}
