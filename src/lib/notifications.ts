// src/lib/notifications.ts — in-app + email notifications
import { prisma } from "@/lib/db";
import { Resend } from "resend";
import { NotificationType } from "@prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDR   = "notifications@reachlogic.net";
const REPLY_TO    = "hello@reachlogic.net";
const FROM_LLC    = `Reach Logic LLC <${FROM_ADDR}>`;
const FROM_RL     = `ReachLogic <${FROM_ADDR}>`;
const BASE_URL    = process.env.NEXT_PUBLIC_BASE_URL ?? "https://reachlogic.net";

function fromMessage(senderFirstName: string) {
  return `${senderFirstName} via ReachLogic <${FROM_ADDR}>`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(n: number, currency = "USD") {
  if (currency === "BDT") return `\u09F3${n.toFixed(2)}`;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function fmtDate(d: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long", day: "numeric", year: "numeric",
  }).format(new Date(d));
}

function firstName(fullName?: string | null, email?: string | null) {
  if (fullName) return fullName.split(" ")[0];
  if (email) return email.split("@")[0];
  return "there";
}

// ─── Shared Layout Builder ────────────────────────────────────────────────────

interface SummaryRow { label: string; value: string }

interface BuildEmailOptions {
  previewText: string;
  greeting: string;
  bodyHtml: string;
  summaryRows?: SummaryRow[];
  ctaLabel: string;
  ctaUrl: string;
}

function buildEmail({
  previewText,
  greeting,
  bodyHtml,
  summaryRows,
  ctaLabel,
  ctaUrl,
}: BuildEmailOptions): string {
  const filteredRows = (summaryRows ?? []).filter(r => r.value && r.value.trim() !== "");

  const summaryHtml = filteredRows.length > 0
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:10px;border:1px solid #e5e5e5;margin:24px 0;">
        <tr><td style="padding:20px 24px;">
          <div style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:14px;">Summary</div>
          ${filteredRows.map((r, i) => `
            <div style="display:flex;justify-content:space-between;align-items:baseline;padding:8px 0;${i < filteredRows.length - 1 ? "border-bottom:1px solid #e5e5e5;" : ""}font-size:14px;">
              <span style="color:#6b7280;white-space:nowrap;margin-right:16px;">${r.label}</span>
              <span style="font-weight:600;color:#111827;text-align:right;">${r.value}</span>
            </div>`).join("")}
        </td></tr>
      </table>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>ReachLogic</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <!-- Preview text (hidden in body, visible in inbox) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${previewText}&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;</div>

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;">

        <!-- Header -->
        <tr><td style="background:#042f28;padding:24px 32px;text-align:center;">
          <span style="font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.02em;">ReachLogic</span>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 32px 28px;">
          <p style="margin:0 0 20px;font-size:15px;color:#0d0d0d;font-weight:500;">${greeting}</p>
          <div style="font-size:15px;color:#4a4a4a;line-height:1.65;">${bodyHtml}</div>
          ${summaryHtml}
          <table cellpadding="0" cellspacing="0" style="margin-top:28px;">
            <tr><td style="background:#042f28;border-radius:8px;">
              <a href="${ctaUrl}" style="display:inline-block;padding:13px 26px;font-size:14px;font-weight:600;color:#fff;text-decoration:none;letter-spacing:-0.01em;">${ctaLabel}</a>
            </td></tr>
          </table>
          <p style="margin:28px 0 0;font-size:14px;color:#6b6b6b;line-height:1.6;">Thanks,<br><strong style="color:#0d0d0d;">The ReachLogic Team</strong></p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:18px 32px;background:#fafafa;border-top:1px solid #e5e5e5;text-align:center;">
          <p style="margin:0 0 4px;font-size:12px;color:#a3a3a3;">Reach Logic LLC &bull; 30 N Gould St Ste R &bull; Sheridan, WY 82801, USA &bull; <a href="https://reachlogic.net" style="color:#a3a3a3;text-decoration:none;">reachlogic.net</a></p>
          <p style="margin:0;font-size:11px;color:#c4c4c4;">You're receiving this because you have an account on the ReachLogic portal.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── In-app notification ──────────────────────────────────────────────────────

interface NotifyOptions {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  sendEmail?: boolean;
}

/** Create an in-app notification only (no email — emails are now per-type) */
export async function notify({
  userId,
  type,
  title,
  body,
  link,
  sendEmail = false, // default OFF — all emails are sent by dedicated functions
}: NotifyOptions) {
  try {
    await prisma.notification.create({
      data: { userId, type, title, body, link },
    });
  } catch (err) {
    console.error("[notify] Error saving notification:", err);
  }

  // Legacy: some callers still pass sendEmail:true — honour it with a simple email
  if (sendEmail) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, fullName: true },
      });
      if (!user) return;
      const actionUrl = link ? `${BASE_URL}${link}` : `${BASE_URL}/portal`;
      await resend.emails.send({
        from: FROM_LLC,
        replyTo: REPLY_TO,
        to: user.email,
        subject: title,
        html: buildEmail({
          previewText: body,
          greeting: `Hi ${firstName(user.fullName, user.email)},`,
          bodyHtml: `<p style="margin:0;">${body}</p>`,
          ctaLabel: "View in Portal",
          ctaUrl: actionUrl,
        }),
      });
    } catch (err) {
      console.error("[notify] legacy email error:", err);
    }
  }
}

// ─── New Message (with smart grouping) ───────────────────────────────────────

/**
 * Called after every message send.
 * - Recipients: CLIENT of thread + CLIENT_COLLEAGUEs in the thread (not the sender)
 * - Team members / admins: in-app only
 * - Smart grouping: if an email was sent for this thread < 30 min ago and the
 *   client hasn't opened the thread since, increment the queue counter instead
 *   of sending a new email.
 */
export async function notifyNewMessage(
  threadId: string,
  senderId: string,
  preview: string
) {
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    include: {
      client: { select: { id: true, fullName: true, email: true, role: true } },
      members: {
        include: {
          user: {
            select: { id: true, role: true, fullName: true, email: true },
          },
        },
      },
      colleagues: {
        include: {
          colleague: {
            select: { id: true, fullName: true, email: true, role: true },
          },
        },
      },
    },
  });
  if (!thread) return;

  // Sender info for display name
  const sender = await prisma.user.findUnique({
    where: { id: senderId },
    select: { fullName: true, email: true, designation: true, role: true },
  });
  const senderName = sender?.fullName ?? sender?.email ?? "Someone";
  const senderFirstName = firstName(sender?.fullName, sender?.email);
  const senderDesignation = sender?.designation ?? "";

  // Build recipient list:
  //   - CLIENT of thread (if not sender)
  //   - CLIENT_COLLEAGUE members of thread (if not sender)
  //   - All thread members who are TEAM_MEMBER or SUPER_ADMIN get in-app only
  const clientRecipients: { id: string; fullName: string | null; email: string }[] = [];
  const staffRecipients: { id: string }[] = [];

  // The client
  if (thread.client.id !== senderId) {
    if (thread.client.role === "CLIENT") {
      clientRecipients.push(thread.client);
    }
  }

  // Thread members
  for (const m of thread.members) {
    if (m.user.id === senderId) continue;
    if (m.user.role === "SUPER_ADMIN" || m.user.role === "TEAM_MEMBER") {
      staffRecipients.push({ id: m.user.id });
    } else if (m.user.role === "CLIENT_COLLEAGUE") {
      clientRecipients.push(m.user);
    }
  }

  // Thread colleagues (from ClientColleague table)
  for (const c of thread.colleagues) {
    if (c.colleague.id === senderId) continue;
    if (!clientRecipients.find(r => r.id === c.colleague.id)) {
      clientRecipients.push(c.colleague);
    }
  }

  // In-app notifications for staff
  for (const s of staffRecipients) {
    await notify({
      userId: s.id,
      type: "NEW_MESSAGE",
      title: `New message in thread`,
      body: preview.length > 100 ? preview.slice(0, 100) + "..." : preview,
      link: `/portal/admin/messages/${thread.clientId}`,
    });
  }

  // In-app + smart email for clients / colleagues
  for (const recipient of clientRecipients) {
    // In-app
    await notify({
      userId: recipient.id,
      type: "NEW_MESSAGE",
      title: `New message about ${thread.name}`,
      body: preview.length > 100 ? preview.slice(0, 100) + "..." : preview,
      link: `/portal/client/messages?thread=${threadId}`,
    });

    // Smart email grouping
    await sendOrQueueMessageEmail({
      threadId,
      threadName: thread.name,
      recipient,
      senderName,
      senderFirstName,
      senderDesignation,
      preview,
    });
  }
}

interface MessageEmailParams {
  threadId: string;
  threadName: string;
  recipient: { id: string; fullName: string | null; email: string };
  senderName: string;
  senderFirstName: string;
  senderDesignation: string;
  preview: string;
}

async function sendOrQueueMessageEmail({
  threadId,
  threadName,
  recipient,
  senderName,
  senderFirstName,
  senderDesignation,
  preview,
}: MessageEmailParams) {
  const SUPPRESS_WINDOW_MS = 30 * 60 * 1000; // 30 minutes
  const now = new Date();
  const previewTrunc = preview.length > 200 ? preview.slice(0, 200) + "..." : preview;

  // Check existing queue entry
  const existing = await prisma.messageEmailQueue.findUnique({
    where: { threadId_recipientId: { threadId, recipientId: recipient.id } },
  });

  if (existing && now.getTime() - existing.lastSentAt.getTime() < SUPPRESS_WINDOW_MS) {
    // Suppress: just update the queue
    const newSenders = existing.senderNames.includes(senderFirstName)
      ? existing.senderNames
      : [...existing.senderNames, senderFirstName];

    await prisma.messageEmailQueue.update({
      where: { id: existing.id },
      data: {
        pendingCount: { increment: 1 },
        senderNames: newSenders,
        lastPreview: previewTrunc,
      },
    });
    return; // Don't send
  }

  // Send a fresh email
  const recipientFirstName = firstName(recipient.fullName, recipient.email);
  const ctaUrl = `${BASE_URL}/portal/client/messages?thread=${threadId}`;

  // Determine from-name and subject
  const fromName = fromMessage(senderFirstName);
  const subject = `New message about ${threadName}`;
  const previewLine = `"${preview.slice(0, 80)}${preview.length > 80 ? "..." : ""}"`;
  const designationPart = senderDesignation ? ` (${senderDesignation})` : "";

  const html = buildEmail({
    previewText: previewLine,
    greeting: `Hi ${recipientFirstName},`,
    bodyHtml: `
      <p style="margin:0 0 16px;">${senderName}${designationPart} sent you a message about <strong>${threadName}</strong>:</p>
      <div style="background:#f9fafb;border-left:4px solid #042f28;padding:14px 18px;border-radius:0 8px 8px 0;margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;font-style:italic;">${previewTrunc}</div>`,
    ctaLabel: "Reply in Portal",
    ctaUrl,
  });

  try {
    await resend.emails.send({
      from: fromName,
      replyTo: REPLY_TO,
      to: recipient.email,
      subject,
      html,
    });
  } catch (err) {
    console.error("[notifyNewMessage] email error:", err);
    return;
  }

  // Update or create queue entry (avoid upsert — Neon HTTP/pooler mode doesn't support implicit transactions)
  const existingQueue = await prisma.messageEmailQueue.findUnique({
    where: { threadId_recipientId: { threadId, recipientId: recipient.id } },
  });
  if (existingQueue) {
    await prisma.messageEmailQueue.update({
      where: { id: existingQueue.id },
      data: {
        lastSentAt: now,
        pendingCount: 1,
        senderNames: [senderFirstName],
        lastPreview: previewTrunc,
      },
    });
  } else {
    await prisma.messageEmailQueue.create({
      data: {
        threadId,
        recipientId: recipient.id,
        lastSentAt: now,
        pendingCount: 1,
        senderNames: [senderFirstName],
        lastPreview: previewTrunc,
      },
    });
  }
}

/**
 * Call this when a client opens a thread to reset the email suppression queue.
 * This allows the next message to send a fresh email.
 */
export async function clearMessageEmailQueue(threadId: string, recipientId: string) {
  await prisma.messageEmailQueue.deleteMany({
    where: { threadId, recipientId },
  });
}

// ─── Project Request Received (client submits a project) ─────────────────────

export async function sendProjectRequestEmail(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { client: { select: { id: true, email: true, fullName: true } } },
  });
  if (!order || !order.client) return;

  const client = order.client;
  const toEmail = client.email;
  const recipientName = firstName(client.fullName, client.email);
  const fmtDate2 = (d: Date) => fmtDate(d);
  const currency = order.currency ?? "USD";

  const summaryRows: SummaryRow[] = [
    { label: "Project", value: order.serviceTitle },
    { label: "Dates", value: `${fmtDate2(order.startDate)} to ${fmtDate2(order.endDate)}` },
    ...(order.amount ? [{ label: "Amount", value: fmtCurrency(Number(order.amount), currency) }] : []),
  ];

  const html = buildEmail({
    previewText: "Our team is reviewing your request.",
    greeting: `Hi ${recipientName},`,
    bodyHtml: `<p style="margin:0;">Thanks for submitting your project. Here's a summary of your request:</p>`,
    summaryRows,
    ctaLabel: "View Project",
    ctaUrl: `${BASE_URL}/portal/client/orders/${orderId}`,
  });

  try {
    await resend.emails.send({
      from: FROM_LLC,
      replyTo: REPLY_TO,
      to: toEmail,
      subject: `We received your project request: ${order.serviceTitle}`.slice(0, 60),
      html,
    });
  } catch (err) {
    console.error("[sendProjectRequestEmail] Error:", err);
  }
}

// ─── Project Created by Admin ─────────────────────────────────────────────────

export async function sendProjectCreatedEmail(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { client: { select: { id: true, email: true, fullName: true } } },
  });
  if (!order || !order.client) return;

  const client = order.client;
  const toEmail = client.email;
  const recipientName = firstName(client.fullName, client.email);
  const currency = order.currency ?? "USD";

  const summaryRows: SummaryRow[] = [
    { label: "Project", value: order.serviceTitle },
    { label: "Dates", value: `${fmtDate(order.startDate)} to ${fmtDate(order.endDate)}` },
    ...(order.amount ? [{ label: "Amount", value: fmtCurrency(Number(order.amount), currency) }] : []),
    { label: "Status", value: "Awaiting Payment" },
  ];

  const html = buildEmail({
    previewText: "Your project and invoice are ready.",
    greeting: `Hi ${recipientName},`,
    bodyHtml: `<p style="margin:0;">A new project has been set up for you on the ReachLogic portal.</p>
      <p style="margin:12px 0 0;">Your invoice is attached. You can also view it anytime in your portal.</p>`,
    summaryRows,
    ctaLabel: "View Project",
    ctaUrl: `${BASE_URL}/portal/client/orders/${orderId}`,
  });

  try {
    await resend.emails.send({
      from: FROM_LLC,
      replyTo: REPLY_TO,
      to: toEmail,
      subject: `New project created: ${order.serviceTitle}`.slice(0, 60),
      html,
    });
  } catch (err) {
    console.error("[sendProjectCreatedEmail] Error:", err);
  }
}

// ─── Invoice Sent ──────────────────────────────────────────────────────────────

export async function sendNewInvoiceEmail(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      client: { select: { id: true, email: true, fullName: true } },
      order: { select: { serviceTitle: true } },
      lineItems: true,
    },
  });
  if (!invoice) return;

  const toEmail = invoice.billingEmail || invoice.client?.email || "";
  if (!toEmail) return;

  const currency = invoice.currency ?? "USD";
  const total = invoice.lineItems.reduce((sum, item) => sum + Number(item.amount), 0);
  const recipientName = firstName(invoice.billingName || invoice.client?.fullName, toEmail);
  const projectTitle = invoice.order?.serviceTitle ?? "Your Project";

  const summaryRows: SummaryRow[] = [
    { label: "Invoice", value: invoice.invoiceNumber },
    { label: "Amount due", value: fmtCurrency(total, currency) },
  ];

  const html = buildEmail({
    previewText: `Amount due ${fmtCurrency(total, currency)}.`,
    greeting: `Hi ${recipientName},`,
    bodyHtml: `<p style="margin:0;">Your invoice for <strong>${projectTitle}</strong> is ready.</p>`,
    summaryRows,
    ctaLabel: "View Invoice",
    ctaUrl: `${BASE_URL}/portal/client/invoices/${invoiceId}`,
  });

  try {
    await resend.emails.send({
      from: FROM_LLC,
      replyTo: REPLY_TO,
      to: toEmail,
      subject: `Invoice ${invoice.invoiceNumber} for ${projectTitle}`.slice(0, 60),
      html,
    });
  } catch (err) {
    console.error("[sendNewInvoiceEmail] Error:", err);
  }
}

// ─── Payment Received ─────────────────────────────────────────────────────────

export async function sendPaymentReceivedEmail(invoiceId: string, amountJustPaid: number) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      client: { select: { id: true, email: true, fullName: true } },
      order: { select: { serviceTitle: true } },
      lineItems: true,
    },
  });
  if (!invoice) return;

  const toEmail = invoice.billingEmail || invoice.client?.email || "";
  if (!toEmail) return;

  const currency = invoice.currency ?? "USD";
  const total = invoice.lineItems.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalPaid = Number(invoice.amountPaid || 0);
  const balanceDue = Math.max(0, total - totalPaid);
  const projectTitle = invoice.order?.serviceTitle ?? "Your Project";
  const recipientName = firstName(invoice.billingName || invoice.client?.fullName, toEmail);

  const summaryRows: SummaryRow[] = [
    { label: "Invoice", value: invoice.invoiceNumber },
    { label: "Amount received", value: fmtCurrency(amountJustPaid, currency) },
    { label: "Paid on", value: fmtDate(new Date()) },
    ...(balanceDue > 0 ? [{ label: "Remaining balance", value: fmtCurrency(balanceDue, currency) }] : []),
  ];

  const html = buildEmail({
    previewText: `Thank you, we received ${fmtCurrency(amountJustPaid, currency)}.`,
    greeting: `Hi ${recipientName},`,
    bodyHtml: `<p style="margin:0;">Thank you! We've received your payment.</p>
      <p style="margin:12px 0 0;">Your updated invoice is attached.</p>`,
    summaryRows,
    ctaLabel: "View Invoice",
    ctaUrl: `${BASE_URL}/portal/client/invoices/${invoiceId}`,
  });

  try {
    await resend.emails.send({
      from: FROM_LLC,
      replyTo: REPLY_TO,
      to: toEmail,
      subject: `Payment received for ${projectTitle}`.slice(0, 60),
      html,
    });
  } catch (err) {
    console.error("[sendPaymentReceivedEmail] Error:", err);
  }
}

// Keep the old name as an alias for backward compat
export { sendPaymentReceivedEmail as sendPaidInvoiceEmail };

// ─── Project In Progress ──────────────────────────────────────────────────────

export async function sendProjectInProgressEmail(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      client: { select: { id: true, email: true, fullName: true } },
      thread: {
        include: {
          members: {
            include: {
              user: { select: { fullName: true, designation: true, role: true } },
            },
          },
        },
      },
    },
  });
  if (!order || !order.client) return;

  const client = order.client;
  const toEmail = client.email;
  const recipientName = firstName(client.fullName, client.email);

  // Build team list from thread members who are staff
  const teamMembers = (order.thread?.members ?? [])
    .filter(m => m.user.role === "SUPER_ADMIN" || m.user.role === "TEAM_MEMBER")
    .map(m => m.user.fullName ? `${m.user.fullName}${m.user.designation ? `, ${m.user.designation}` : ""}` : "")
    .filter(Boolean);

  const summaryRows: SummaryRow[] = [
    { label: "Project", value: order.serviceTitle },
    { label: "Status", value: "In Progress" },
    ...(teamMembers.length > 0 ? [{ label: "Your team", value: teamMembers.join(" | ") }] : []),
  ];

  const ctaUrl = order.threadId
    ? `${BASE_URL}/portal/client/messages?thread=${order.threadId}`
    : `${BASE_URL}/portal/client/orders/${orderId}`;

  const html = buildEmail({
    previewText: "Your project is now in progress.",
    greeting: `Hi ${recipientName},`,
    bodyHtml: `<p style="margin:0;">Good news, work on your project has started.</p>
      <p style="margin:12px 0 0;">You can follow updates and talk with your team in the portal.</p>`,
    summaryRows,
    ctaLabel: "Open Project Thread",
    ctaUrl,
  });

  try {
    await resend.emails.send({
      from: FROM_LLC,
      replyTo: REPLY_TO,
      to: toEmail,
      subject: `Work has started on ${order.serviceTitle}`.slice(0, 60),
      html,
    });
  } catch (err) {
    console.error("[sendProjectInProgressEmail] Error:", err);
  }
}

// ─── Project Completed ────────────────────────────────────────────────────────

export async function sendProjectCompletedEmail(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { client: { select: { id: true, email: true, fullName: true } } },
  });
  if (!order || !order.client) return;

  const client = order.client;
  const recipientName = firstName(client.fullName, client.email);

  const summaryRows: SummaryRow[] = [
    { label: "Project", value: order.serviceTitle },
    { label: "Completed on", value: fmtDate(new Date()) },
  ];

  const html = buildEmail({
    previewText: "Thank you for working with ReachLogic.",
    greeting: `Hi ${recipientName},`,
    bodyHtml: `<p style="margin:0;">Your project has been marked as completed.</p>
      <p style="margin:12px 0 0;">Thank you for working with ReachLogic. If you have any questions or need anything else, just reply in the portal.</p>`,
    summaryRows,
    ctaLabel: "View Project",
    ctaUrl: `${BASE_URL}/portal/client/orders/${orderId}`,
  });

  try {
    await resend.emails.send({
      from: FROM_LLC,
      replyTo: REPLY_TO,
      to: client.email,
      subject: `${order.serviceTitle} has been completed`.slice(0, 60),
      html,
    });
  } catch (err) {
    console.error("[sendProjectCompletedEmail] Error:", err);
  }
}

// ─── Project Cancelled ────────────────────────────────────────────────────────

export async function sendProjectCancelledEmail(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { client: { select: { id: true, email: true, fullName: true } } },
  });
  if (!order || !order.client) return;

  const client = order.client;
  const recipientName = firstName(client.fullName, client.email);

  const summaryRows: SummaryRow[] = [
    { label: "Project", value: order.serviceTitle },
    { label: "Cancelled on", value: fmtDate(new Date()) },
  ];

  const html = buildEmail({
    previewText: "Your project status was updated.",
    greeting: `Hi ${recipientName},`,
    bodyHtml: `<p style="margin:0;">Your project has been cancelled.</p>
      <p style="margin:12px 0 0;">If you think this is a mistake or have questions, please message us in the portal.</p>`,
    summaryRows,
    ctaLabel: "View Project",
    ctaUrl: `${BASE_URL}/portal/client/orders/${orderId}`,
  });

  try {
    await resend.emails.send({
      from: FROM_LLC,
      replyTo: REPLY_TO,
      to: client.email,
      subject: `${order.serviceTitle} has been cancelled`.slice(0, 60),
      html,
    });
  } catch (err) {
    console.error("[sendProjectCancelledEmail] Error:", err);
  }
}

// ─── Refund Issued ────────────────────────────────────────────────────────────

export async function sendRefundNotificationEmail(
  invoiceId: string,
  { refundAmount }: { refundAmount: number }
) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      client: { select: { email: true, fullName: true } },
      order: { select: { serviceTitle: true } },
    },
  });
  if (!invoice) return;

  const toEmail = invoice.billingEmail || invoice.client?.email || "";
  if (!toEmail) return;

  const currency = invoice.currency ?? "USD";
  const projectTitle = invoice.order?.serviceTitle ?? "Your Project";
  const recipientName = firstName(invoice.billingName || invoice.client?.fullName, toEmail);

  const summaryRows: SummaryRow[] = [
    { label: "Invoice", value: invoice.invoiceNumber },
    { label: "Refund amount", value: fmtCurrency(refundAmount, currency) },
    { label: "Refund date", value: fmtDate(new Date()) },
    ...(invoice.refundMethod ? [{ label: "Method", value: invoice.refundMethod }] : []),
  ];

  const html = buildEmail({
    previewText: `We've refunded ${fmtCurrency(refundAmount, currency)}.`,
    greeting: `Hi ${recipientName},`,
    bodyHtml: `<p style="margin:0;">We've issued a refund for your project.</p>
      <p style="margin:12px 0 0;">Your updated invoice is attached. Depending on your payment provider, it may take a few days to appear in your account.</p>`,
    summaryRows,
    ctaLabel: "View Invoice",
    ctaUrl: `${BASE_URL}/portal/client/invoices/${invoiceId}`,
  });

  try {
    await resend.emails.send({
      from: FROM_LLC,
      replyTo: REPLY_TO,
      to: toEmail,
      subject: `Refund issued for ${projectTitle}`.slice(0, 60),
      html,
    });
  } catch (err) {
    console.error("[sendRefundNotificationEmail] Error:", err);
  }
}

// ─── Void notification (kept for compatibility) ───────────────────────────────

export async function sendVoidNotificationEmail(invoiceId: string, reason: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { client: { select: { email: true, fullName: true } } },
  });
  if (!invoice) return;

  const toEmail = invoice.billingEmail || invoice.client?.email || "";
  if (!toEmail) return;

  const recipientName = firstName(invoice.billingName || invoice.client?.fullName, toEmail);

  const html = buildEmail({
    previewText: `Invoice ${invoice.invoiceNumber} has been voided.`,
    greeting: `Hi ${recipientName},`,
    bodyHtml: `<p style="margin:0;">Invoice <strong>${invoice.invoiceNumber}</strong> has been voided.</p>
      ${reason ? `<p style="margin:12px 0 0;">Reason: ${reason}</p>` : ""}`,
    ctaLabel: "View Invoice",
    ctaUrl: `${BASE_URL}/portal/client/invoices/${invoiceId}`,
  });

  try {
    await resend.emails.send({
      from: FROM_LLC,
      replyTo: REPLY_TO,
      to: toEmail,
      subject: `Invoice ${invoice.invoiceNumber} - Voided`.slice(0, 60),
      html,
    });
  } catch (err) {
    console.error("[sendVoidNotificationEmail] Error:", err);
  }
}

export async function sendSystemGlitchNotificationEmail(invoiceId: string, reason: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { client: { select: { email: true, fullName: true } } },
  });
  if (!invoice) return;

  const toEmail = invoice.billingEmail || invoice.client?.email || "";
  if (!toEmail) return;

  const recipientName = firstName(invoice.billingName || invoice.client?.fullName, toEmail);

  const html = buildEmail({
    previewText: `Invoice ${invoice.invoiceNumber} has been cancelled.`,
    greeting: `Hi ${recipientName},`,
    bodyHtml: `<p style="margin:0;">Invoice <strong>${invoice.invoiceNumber}</strong> has been cancelled due to a system error.</p>
      ${reason ? `<p style="margin:12px 0 0;">Note: ${reason}</p>` : ""}`,
    ctaLabel: "View Invoice",
    ctaUrl: `${BASE_URL}/portal/client/invoices/${invoiceId}`,
  });

  try {
    await resend.emails.send({
      from: FROM_LLC,
      replyTo: REPLY_TO,
      to: toEmail,
      subject: `Invoice ${invoice.invoiceNumber} - Cancelled (System Error)`.slice(0, 60),
      html,
    });
  } catch (err) {
    console.error("[sendSystemGlitchNotificationEmail] Error:", err);
  }
}

// ─── Legacy wrappers (for callers that use these names) ───────────────────────

/** @deprecated — use sendPaymentReceivedEmail instead */
export async function notifyInvoiceCreated(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { client: { select: { id: true } } },
  });
  if (!invoice?.clientId) return;
  await notify({
    userId: invoice.clientId,
    type: "INVOICE_CREATED",
    title: `New invoice: ${invoice.invoiceNumber}`,
    body: `A new invoice (${invoice.invoiceNumber}) has been created for you.`,
    link: `/portal/client/invoices/${invoiceId}`,
  });
}

/** @deprecated — kept for callers still using this */
export async function notifyOrderStatus(orderId: string, newStatus: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { client: { select: { id: true } } },
  });
  if (!order) return;

  const statusLabel: Record<string, string> = {
    AWAITING_QUOTE: "Awaiting Payment",
    PENDING: "Awaiting Payment",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  if (order.clientId) {
    await notify({
      userId: order.clientId,
      type: "ORDER_STATUS_CHANGED",
      title: `Project update: ${order.serviceTitle}`,
      body: `Your project "${order.serviceTitle}" is now ${statusLabel[newStatus] ?? newStatus}.`,
      link: `/portal/client/orders/${orderId}`,
    });
  }
}

/** @deprecated — in-app notify for invite accepted; no client email needed */
export async function notifyInviteAccepted(acceptedUserId: string) {
  const accepted = await prisma.user.findUnique({
    where: { id: acceptedUserId },
    select: { fullName: true, email: true, role: true },
  });
  if (!accepted) return;

  const admins = await prisma.user.findMany({
    where: { role: "SUPER_ADMIN", isActive: true },
    select: { id: true },
  });

  const name = accepted.fullName ?? accepted.email;
  const roleLabel = accepted.role === "CLIENT" ? "client" : "team member";
  const link = accepted.role === "CLIENT" ? "/portal/admin/clients" : "/portal/admin/team";

  await Promise.all(
    admins.map((admin) =>
      notify({
        userId: admin.id,
        type: "INVITATION_SENT",
        title: `${name} joined as a ${roleLabel}`,
        body: `${name} (${accepted.email}) has accepted their invitation.`,
        link,
      })
    )
  );
}
