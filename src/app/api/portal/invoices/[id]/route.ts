// src/app/api/portal/invoices/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { notify, sendPaidInvoiceEmail, sendPaymentReceivedEmail } from "@/lib/notifications";

const schema = z.object({
  action: z.enum(["mark_sent", "mark_paid", "mark_overdue", "cancel", "reopen", "record_payment", "resend_email", "delete_payment"]),
  paidAt: z.string().optional(),
  amount: z.number().positive().optional(), // for record_payment
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

    const { action, paidAt, amount } = parsed.data;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, fullName: true, email: true } },
        lineItems: true,
      },
    });
    if (!invoice) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });

    const total = invoice.lineItems.reduce((sum, item) => sum + Number(item.amount), 0);

    let updateData: Record<string, unknown> = {};

    switch (action) {
      case "mark_sent":
        updateData = {}; // No DB field yet — logged only
        break;
      case "mark_paid":
        updateData = { isPaid: true, paidAt: paidAt ? new Date(paidAt) : new Date(), amountPaid: total };
        break;
      case "record_payment": {
        if (!amount) return NextResponse.json({ error: "Amount is required." }, { status: 400 });
        const currentPaid = Number(invoice.amountPaid || 0);
        const newPaid = Math.min(currentPaid + amount, total);
        const fullyPaid = newPaid >= total;
        updateData = {
          amountPaid: newPaid,
          isPaid: fullyPaid,
          paidAt: fullyPaid ? new Date() : invoice.paidAt,
        };
        break;
      }
      case "delete_payment":
        updateData = { amountPaid: 0, isPaid: false, paidAt: null };
        break;
      case "mark_overdue":
        // Overdue is a UI status — surfaced via dueDate < now() && !isPaid
        break;
      case "cancel":
        updateData = { isLocked: true };
        break;
      case "reopen":
        updateData = { isPaid: false, paidAt: null, isLocked: false, amountPaid: 0 };
        break;
      case "resend_email":
        // Send invoice email without marking paid
        try {
          await sendInvoiceReminderEmail(id);
        } catch (err) {
          console.error("[invoices/resend_email]", err);
          return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
        }
        return NextResponse.json({ ok: true, message: "Invoice email resent." });
    }

    const updated = await prisma.invoice.update({ where: { id }, data: updateData });

    // Notifications for paid actions
    if (action === "mark_paid" || action === "record_payment") {
      // Always send payment email (partial or full) with Total/Paid/Due
      sendPaymentReceivedEmail(invoice.id, amount ?? (action === "mark_paid" ? total : 0)).catch(
        (err) => console.error("[invoices/payment email]", err)
      );

      // If fully paid, also post to thread
      if (action === "mark_paid" || (action === "record_payment" && updated.isPaid)) {
        const thread = await prisma.thread.findFirst({ where: { clientId: invoice.clientId || "", name: "General" } })
          ?? await prisma.thread.findFirst({ where: { clientId: invoice.clientId || "" } });
        if (thread) {
          await prisma.message.create({
            data: {
              threadId: thread.id,
              body: `💳 Payment recorded for Invoice ${invoice.invoiceNumber}. Thank you!`,
              type: "SYSTEM",
              metadata: { invoiceId: id, event: "invoice_paid" },
            },
          });
        }
      } else if (action === "record_payment" && !updated.isPaid) {
        // Partial payment in-app notification
        const fmtAmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
        if (invoice.clientId) {
          await notify({
            userId: invoice.clientId,
            type: "INVOICE_PAID",
            title: `Partial Payment Recorded: ${invoice.invoiceNumber}`,
            body: `A payment of ${fmtAmt(amount ?? 0)} has been recorded for Invoice ${invoice.invoiceNumber}.`,
            link: `/portal/client/invoices/${invoice.id}`,
            sendEmail: false, // email already sent via sendPaymentReceivedEmail
          });
        }
      }
    }

    return NextResponse.json({ ok: true, invoice: updated });
  } catch (err) {
    console.error("[invoices/[id] PATCH]", err);
    return NextResponse.json({ error: "Failed to update invoice." }, { status: 500 });
  }
}

/** Send a reminder email for an unpaid invoice */
async function sendInvoiceReminderEmail(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      client: { select: { id: true, email: true, fullName: true } },
      order: { select: { serviceTitle: true } },
      lineItems: true,
    },
  });
  if (!invoice) return;

  const total = invoice.lineItems.reduce((sum, item) => sum + Number(item.amount), 0);
  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
  const fmtDate = (d: Date) => new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(d);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://reachlogic.net";

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "ReachLogic <portal@reachlogic.net>",
    to: invoice.client?.email || "",
    subject: `Invoice ${invoice.invoiceNumber} — Payment Reminder`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #111827;">
        <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 4px;">Payment Reminder</h1>
        <p style="color: #6b7280; margin-top: 0;">Invoice ${invoice.invoiceNumber}</p>
        <table style="width:100%; border-collapse:collapse; margin: 24px 0; font-size: 14px;">
          <tr><td style="padding:8px 0; color:#6b7280;">Project</td><td style="padding:8px 0; font-weight:600;">${invoice.order?.serviceTitle ?? "—"}</td></tr>
          <tr><td style="padding:8px 0; color:#6b7280;">Total Amount</td><td style="padding:8px 0; font-weight:600;">${fmt(total)}</td></tr>
          <tr><td style="padding:8px 0; color:#6b7280;">Due Date</td><td style="padding:8px 0; font-weight:600; color:#ea580c;">${fmtDate(invoice.dueDate)}</td></tr>
        </table>
        <a href="${BASE_URL}/portal/client/invoices/${invoice.id}" style="display:inline-block; padding:12px 24px; background:#1a3c34; color:#fff; text-decoration:none; border-radius:8px; font-weight:600; font-size:14px;">
          View Invoice
        </a>
        <p style="margin-top: 32px; font-size: 12px; color: #9ca3af;">ReachLogic · reply to this email if you have questions.</p>
      </div>
    `,
  });
}
