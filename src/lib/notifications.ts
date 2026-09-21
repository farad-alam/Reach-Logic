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
  try {
    await prisma.notification.create({
      data: { userId, type, title, body, link },
    });
  } catch (err) {
    console.error("[notify] Error saving notification to DB:", err);
  }

  if (!sendEmail) return;

  // Send email
  try {
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
  } catch (emailErr) {
    console.error("[notify] Error sending email via Resend:", emailErr);
  }
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

/** Send a rich HTML email receipt when an invoice is marked as paid */
export async function sendPaidInvoiceEmail(invoiceId: string) {
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

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(d);

  // In-app notification
  try {
    await prisma.notification.create({
      data: {
        userId: invoice.clientId,
        type: "INVOICE_PAID",
        title: `Payment Recorded: ${invoice.invoiceNumber}`,
        body: `Your invoice ${invoice.invoiceNumber} has been marked as paid. Thank you!`,
        link: `/portal/client/invoices/${invoice.id}`,
      },
    });
  } catch (_err) { /* non-critical */ }

  const actionUrl = `${BASE_URL}/portal/client/invoices/${invoice.id}`;
  const billToName = invoice.billingName || invoice.client.fullName || invoice.client.email;

  // Line items rows
  const lineItemRows = invoice.lineItems.map((item) =>
    "<tr>" +
    `<td style="padding:12px 0;border-bottom:1px solid #e5e5e5;font-size:14px;color:#0d0d0d;">${item.description}</td>` +
    `<td style="padding:12px 0;border-bottom:1px solid #e5e5e5;font-size:14px;color:#6b6b6b;text-align:right;">${Number(item.quantity)}</td>` +
    `<td style="padding:12px 0;border-bottom:1px solid #e5e5e5;font-size:14px;color:#6b6b6b;text-align:right;">${fmt(Number(item.rate))}</td>` +
    `<td style="padding:12px 0;border-bottom:1px solid #e5e5e5;font-size:14px;color:#0d0d0d;font-weight:600;text-align:right;">${fmt(Number(item.amount))}</td>` +
    "</tr>"
  ).join("");

  const billingLines = [
    `<strong>${billToName}</strong><br/>`,
    invoice.billingCompany ? invoice.billingCompany + "<br/>" : "",
    invoice.billingEmail ? invoice.billingEmail + "<br/>" : "",
    invoice.billingAddress ? invoice.billingAddress.split("\n").join("<br/>") : "",
  ].join("");

  const html =
    "<!DOCTYPE html><html>" +
    `<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">` +
    `<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 24px;">` +
    `<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">` +
    // Header
    `<tr><td style="background:#042f28;padding:24px 32px;text-align:center;">` +
    `<span style="font-size:24px;font-weight:700;color:#fff;letter-spacing:-0.02em;">ReachLogic</span>` +
    `<p style="color:#a3c5bf;margin:4px 0 0;font-size:14px;">Payment Receipt</p>` +
    `</td></tr>` +
    // Body
    `<tr><td style="padding:32px;">` +
    `<h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#0d0d0d;">Thank you for your payment!</h2>` +
    `<p style="margin:0 0 32px;font-size:15px;color:#4a4a4a;line-height:1.6;">We have received your payment for Invoice <strong>#${invoice.invoiceNumber}</strong>. Below is a summary of your receipt for your records.</p>` +
    // Bill To / metadata
    `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;"><tr>` +
    `<td width="50%" valign="top">` +
    `<div style="font-size:12px;font-weight:600;color:#888;text-transform:uppercase;margin-bottom:8px;">Billed To:</div>` +
    `<div style="font-size:14px;color:#0d0d0d;line-height:1.5;">${billingLines}</div>` +
    `</td>` +
    `<td width="50%" valign="top" align="right">` +
    `<div style="font-size:14px;color:#6b6b6b;margin-bottom:4px;">Date Paid: <strong style="color:#0d0d0d;">${invoice.paidAt ? fmtDate(invoice.paidAt) : fmtDate(new Date())}</strong></div>` +
    `<div style="font-size:14px;color:#6b6b6b;">Total Paid: <strong style="color:#0d0d0d;">${fmt(total)}</strong></div>` +
    `</td></tr></table>` +
    // Line items table
    `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">` +
    `<thead><tr>` +
    `<th style="padding-bottom:12px;border-bottom:2px solid #e5e5e5;text-align:left;font-size:12px;color:#888;text-transform:uppercase;">Description</th>` +
    `<th style="padding-bottom:12px;border-bottom:2px solid #e5e5e5;text-align:right;font-size:12px;color:#888;text-transform:uppercase;">Qty</th>` +
    `<th style="padding-bottom:12px;border-bottom:2px solid #e5e5e5;text-align:right;font-size:12px;color:#888;text-transform:uppercase;">Rate</th>` +
    `<th style="padding-bottom:12px;border-bottom:2px solid #e5e5e5;text-align:right;font-size:12px;color:#888;text-transform:uppercase;">Amount</th>` +
    `</tr></thead>` +
    `<tbody>${lineItemRows}</tbody>` +
    `<tfoot><tr>` +
    `<td colspan="3" style="padding:16px 0;text-align:right;font-size:16px;font-weight:700;color:#0d0d0d;">Total Paid</td>` +
    `<td style="padding:16px 0;text-align:right;font-size:20px;font-weight:800;color:#042f28;">${fmt(total)}</td>` +
    `</tr></tfoot>` +
    `</table>` +
    // CTA
    `<div style="text-align:center;">` +
    `<a href="${actionUrl}" style="display:inline-block;background:#042f28;color:#fff;padding:12px 24px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;">Download PDF in Portal &rarr;</a>` +
    `</div>` +
    `</td></tr>` +
    // Footer
    `<tr><td style="padding:24px 32px;background:#fafafa;border-top:1px solid #e5e5e5;text-align:center;">` +
    `<p style="margin:0;font-size:12px;color:#a3a3a3;">ReachLogic &bull; hello@reachlogic.net &bull; www.reachlogic.net</p>` +
    `</td></tr>` +
    `</table></td></tr></table>` +
    `</body></html>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: invoice.client.email,
      subject: `Payment Receipt: Invoice ${invoice.invoiceNumber}`,
      html,
    });
  } catch (err) {
    console.error("[sendPaidInvoiceEmail] Error:", err);
  }
}

/** Notify the admin(s) when a user accepts their invitation */
export async function notifyInviteAccepted(acceptedUserId: string) {
  const accepted = await prisma.user.findUnique({
    where: { id: acceptedUserId },
    select: { fullName: true, email: true, role: true },
  });
  if (!accepted) return;

  // Notify all SUPER_ADMINs
  const admins = await prisma.user.findMany({
    where: { role: "SUPER_ADMIN", isActive: true },
    select: { id: true },
  });

  const name = accepted.fullName ?? accepted.email;
  const roleLabel = accepted.role === "CLIENT" ? "client" : "team member";
  const link = accepted.role === "CLIENT"
    ? `/portal/admin/clients`
    : `/portal/admin/team`;

  await Promise.all(
    admins.map((admin) =>
      notify({
        userId: admin.id,
        type: "INVITATION_SENT",
        title: `${name} joined as a ${roleLabel}`,
        body: `${name} (${accepted.email}) has accepted their invitation and created their account.`,
        link,
        sendEmail: false, // in-app only — avoid spam on every accept
      })
    )
  );
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
            View in Portal &rarr;
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
