// src/app/api/portal/invoices/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { notify, sendPaidInvoiceEmail } from "@/lib/notifications";

const schema = z.object({
  action: z.enum(["mark_sent", "mark_paid", "mark_overdue", "cancel", "reopen"]),
  paidAt: z.string().optional(), // ISO date string when action = mark_paid
});

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
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input.", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { action, paidAt } = parsed.data;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { client: { select: { id: true, fullName: true, email: true } } },
    });
    if (!invoice) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });

    let updateData: Record<string, unknown> = {};

    switch (action) {
      case "mark_sent":
        updateData = {}; // No DB field yet — logged only
        break;
      case "mark_paid":
        updateData = { isPaid: true, paidAt: paidAt ? new Date(paidAt) : new Date() };
        break;
      case "mark_overdue":
        // Overdue is a UI status — we surface it via dueDate < now() && !isPaid
        // Nothing to store, just return current state
        break;
      case "cancel":
        updateData = { isLocked: true };
        break;
      case "reopen":
        updateData = { isPaid: false, paidAt: null, isLocked: false };
        break;
    }

    const updated = await prisma.invoice.update({ where: { id }, data: updateData });

    // Notifications
    if (action === "mark_paid") {
      await sendPaidInvoiceEmail(invoice.id);

      // System message to thread
      const thread = await prisma.thread.findUnique({ where: { clientId: invoice.clientId } });
      if (thread) {
        await prisma.message.create({
          data: {
            threadId: thread.id,
            body: `Payment recorded for Invoice ${invoice.invoiceNumber}. Thank you!`,
            type: "SYSTEM",
            metadata: { invoiceId: id, event: "invoice_paid" },
          },
        });
      }
    }

    return NextResponse.json({ ok: true, invoice: updated });
  } catch (err) {
    console.error("[invoices/[id] PATCH]", err);
    return NextResponse.json({ error: "Failed to update invoice." }, { status: 500 });
  }
}
