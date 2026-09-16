// src/app/api/portal/invoices/[id]/pay/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notify } from "@/lib/notifications";

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
    
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { 
        client: { select: { id: true } },
        order: { select: { id: true, serviceTitle: true, status: true } }
      }
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    if (invoice.isPaid) {
       return NextResponse.json({ error: "Invoice is already paid." }, { status: 400 });
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        isPaid: true,
        paidAt: new Date(),
      }
    });

    // Notify client
    await notify({
      userId: invoice.clientId,
      type: "INVOICE_PAID",
      title: `Payment Received: Invoice ${invoice.invoiceNumber}`,
      body: `We have received your payment for Invoice ${invoice.invoiceNumber}${invoice.order ? ` (${invoice.order.serviceTitle})` : ""}. Thank you!`,
      link: `/portal/client/invoices/${invoice.id}`,
    });

    // Auto-post to thread
    const thread = await prisma.thread.findUnique({
      where: { clientId: invoice.clientId }
    });

    if (thread) {
      await prisma.message.create({
        data: {
          threadId: thread.id,
          body: `Payment received for Invoice ${invoice.invoiceNumber}. Thank you!`,
          type: "SYSTEM",
          metadata: { invoiceId: invoice.id, orderId: invoice.orderId, event: "invoice_paid" },
        }
      });
    }

    return NextResponse.json({ ok: true, invoice: updatedInvoice });
  } catch (error) {
    console.error("[invoices/pay]", error);
    return NextResponse.json({ error: "Failed to mark invoice as paid." }, { status: 500 });
  }
}
