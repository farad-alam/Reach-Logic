// src/lib/notifications.ts — create in-app + email notifications
import { prisma } from "@/lib/db";
import { Resend } from "resend";
import { NotificationType } from "@prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "ReachLogic <portal@reachlogic.net>";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://reachlogic.net";

interface NotifyOptions {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  sendEmail?: boolean;
}

/** Create an in-app notification and optionally send an email */
export async function notify({
  userId,
  type,
  title,
  body,
  link,
  sendEmail = true,
}: NotifyOptions) {
  // Store in DB
  await prisma.notification.create({
    data: { userId, type, title, body, link },
  });

  if (!sendEmail) return;

  // Send email
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, fullName: true },
  });
  if (!user) return;

  const actionUrl = link ? `${BASE_URL}${link}` : `${BASE_URL}/portal`;

  await resend.emails.send({
    from: FROM,
    to: user.email,
    subject: title,
    html: buildNotificationEmail({ title, body, actionUrl }),
  });
}

/** Notify all thread participants about a new message */
export async function notifyNewMessage(
  threadId: string,
  senderId: string,
  preview: string
) {
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    include: {
      client: { select: { id: true } },
      members: { include: { user: { select: { id: true, role: true } } } },
    },
  });
  if (!thread) return;

  // All participants: client + assigned members
  const participantIds = [
    thread.client.id,
    ...thread.members.map((m) => m.user.id),
  ].filter((id) => id !== senderId); // don't notify sender

  const link =
    thread.client.id === senderId
      ? `/portal/client/messages`
      : `/portal/admin/messages/${thread.clientId}`;

  await Promise.all(
    participantIds.map((userId) =>
      notify({
        userId,
        type: "NEW_MESSAGE",
        title: "New message",
        body: preview.length > 100 ? preview.slice(0, 100) + "…" : preview,
        link,
      })
    )
  );
}

/** Notify client about order status change */
export async function notifyOrderStatus(
  orderId: string,
  newStatus: string
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { client: { select: { id: true } } },
  });
  if (!order) return;

  const statusLabel: Record<string, string> = {
    AWAITING_QUOTE: "Awaiting Quote",
    PENDING: "Confirmed – Pending Start",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  await notify({
    userId: order.clientId,
    type: "ORDER_STATUS_CHANGED",
    title: `Order update: ${order.serviceTitle}`,
    body: `Your order "${order.serviceTitle}" is now ${statusLabel[newStatus] ?? newStatus}.`,
    link: `/portal/client/orders/${orderId}`,
  });
}

/** Notify client about a new invoice */
export async function notifyInvoiceCreated(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { client: { select: { id: true } } },
  });
  if (!invoice) return;

  await notify({
    userId: invoice.clientId,
    type: "INVOICE_CREATED",
    title: `New invoice: ${invoice.invoiceNumber}`,
    body: `A new invoice (${invoice.invoiceNumber}) has been created for you. Check your invoices for details.`,
    link: `/portal/client/invoices/${invoiceId}`,
  });
}

// ─── Email template ───────────────────────────────────────────────────────────
function buildNotificationEmail({
  title,
  body,
  actionUrl,
}: {
  title: string;
  body: string;
  actionUrl: string;
}) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
        <tr><td style="background:#042f28;padding:20px 32px;">
          <span style="font-size:18px;font-weight:700;color:#fff;letter-spacing:-0.02em;">ReachLogic</span>
        </td></tr>
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 10px;font-size:18px;font-weight:700;color:#0d0d0d;">${title}</h2>
          <p style="margin:0 0 24px;font-size:14px;color:#6b6b6b;line-height:1.6;">${body}</p>
          <a href="${actionUrl}" style="display:inline-block;background:#042f28;color:#fff;padding:11px 22px;border-radius:7px;font-size:14px;font-weight:600;text-decoration:none;">
            View in Portal →
          </a>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #e5e5e5;">
          <p style="margin:0;font-size:11px;color:#c4c4c4;">You're receiving this because you have an account on the ReachLogic portal.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
