// src/lib/invitations.ts — Invitation helpers
import { prisma } from "@/lib/db";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_LLC  = "Reach Logic LLC <notifications@reachlogic.net>";
const REPLY_TO  = "hello@reachlogic.net";
const BASE_URL  = process.env.NEXT_PUBLIC_BASE_URL ?? "https://reachlogic.net";

/** Generate a secure random token */
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

/** Send a client invitation */
export async function sendClientInvitation(
  email: string,
  invitedById: string
): Promise<{ ok: boolean; error?: string }> {
  // Check not already an active user
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing?.isActive) return { ok: false, error: "This email already has an account." };

  // Expire any old pending invitations for this email
  await prisma.invitation.updateMany({
    where: { email: email.toLowerCase(), acceptedAt: null },
    data: { expiresAt: new Date() }, // expire immediately
  });

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.invitation.create({
    data: {
      email: email.toLowerCase(),
      role: "CLIENT",
      token,
      expiresAt,
      invitedById,
    },
  });

  const link = `${BASE_URL}/portal/invite/${token}`;

  await resend.emails.send({
    from: FROM_LLC,
    replyTo: REPLY_TO,
    to: email,
    subject: "You're invited to the ReachLogic Client Portal",
    html: buildClientInviteEmail({ link, expiresAt }),
  });

  return { ok: true };
}

/** Send a team member invitation */
export async function sendTeamInvitation(
  email: string,
  invitedById: string
): Promise<{ ok: boolean; error?: string }> {
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing?.isActive) return { ok: false, error: "This email already has an account." };

  await prisma.invitation.updateMany({
    where: { email: email.toLowerCase(), acceptedAt: null },
    data: { expiresAt: new Date() },
  });

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.invitation.create({
    data: {
      email: email.toLowerCase(),
      role: "TEAM_MEMBER",
      token,
      expiresAt,
      invitedById,
    },
  });

  const link = `${BASE_URL}/portal/invite/${token}`;

  await resend.emails.send({
    from: FROM_LLC,
    replyTo: REPLY_TO,
    to: email,
    subject: "You're invited to join the ReachLogic team",
    html: buildTeamInviteEmail({ link, expiresAt }),
  });

  return { ok: true };
}

/** Send a colleague invitation with a temporary password */
export async function sendColleagueInvitation(
  email: string,
  tempPassword: string,
  threadName: string,
  clientName: string
): Promise<{ ok: boolean; error?: string }> {
  const link = `${BASE_URL}/portal/login`;

  await resend.emails.send({
    from: FROM_LLC,
    replyTo: REPLY_TO,
    to: email,
    subject: `You've been added to a thread: ${threadName}`,
    html: buildColleagueInviteEmail({ email, link, tempPassword, threadName }),
  });

  return { ok: true };
}

/** Validate an invitation token — returns invitation if valid */
export async function validateInviteToken(token: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { invitedBy: { select: { fullName: true } } },
  });

  if (!invitation) return { valid: false, reason: "Invalid invitation link." };
  if (invitation.acceptedAt) return { valid: false, reason: "This invitation has already been used." };
  if (invitation.expiresAt < new Date()) return { valid: false, reason: "This invitation has expired." };

  return { valid: true, invitation };
}

/** Accept an invitation — create user, mark invitation accepted, create thread if client */
export async function acceptInvitation(
  token: string,
  fullName: string,
  passwordHash: string,
  city?: string,
  state?: string,
  timezone?: string,
  country?: string
): Promise<{ ok: boolean; userId?: string; role?: string; error?: string }> {
  const check = await validateInviteToken(token);
  if (!check.valid || !check.invitation) return { ok: false, error: check.reason };

  const { invitation } = check;

  // Create user
  const user = await prisma.user.create({
    data: {
      email: invitation.email,
      fullName: fullName.trim(),
      city: city ? city.trim() : null,
      state: state ? state.trim() : null,
      timezone: timezone ? timezone.trim() : null,
      country: country ? country.trim() : null,
      passwordHash,
      role: invitation.role,
      isActive: true,
    },
  });

  // Mark invitation accepted
  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { acceptedAt: new Date(), userId: user.id },
  });

  // If client → auto-create their message thread with super admin as member
  if (invitation.role === "CLIENT") {
    const thread = await prisma.thread.create({
      data: { clientId: user.id },
    });

    // Add super admin(s) to thread
    const admins = await prisma.user.findMany({
      where: { role: "SUPER_ADMIN", isActive: true },
      select: { id: true },
    });

    await prisma.threadMember.createMany({
      data: admins.map((a) => ({ threadId: thread.id, userId: a.id })),
    });

    // System welcome message
    await prisma.message.create({
      data: {
        threadId: thread.id,
        senderId: null,
        body: `Welcome to ReachLogic, ${fullName.split(" ")[0]}! Your account is set up and we're ready to work with you. Feel free to message us here anytime.`,
        type: "SYSTEM",
        metadata: { event: "account_created" },
      },
    });
  }

  return { ok: true, userId: user.id, role: invitation.role };
}

// ─── Email templates ──────────────────────────────────────────────────────────

function fmtFullDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long", day: "numeric", year: "numeric",
  }).format(d);
}

function sharedEmailWrapper(bodyContent: string, previewText: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>ReachLogic</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${previewText}&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;</div>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;">
        <tr><td style="background:#042f28;padding:22px 32px;text-align:center;">
          <span style="font-size:21px;font-weight:700;color:#fff;letter-spacing:-0.02em;">ReachLogic</span>
        </td></tr>
        <tr><td style="padding:36px 32px 28px;">
          ${bodyContent}
          <p style="margin:28px 0 0;font-size:14px;color:#6b6b6b;line-height:1.6;">Thanks,<br><strong style="color:#0d0d0d;">The ReachLogic Team</strong></p>
        </td></tr>
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

function buildClientInviteEmail({ link, expiresAt }: { link: string; expiresAt: Date }) {
  const expiryDate = fmtFullDate(expiresAt);
  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#0d0d0d;font-weight:500;">Hello,</p>
    <p style="margin:0 0 20px;font-size:15px;color:#4a4a4a;line-height:1.65;">You've been invited to join the <strong>ReachLogic Client Portal</strong>.</p>
    <p style="margin:0 0 8px;font-size:14px;color:#6b6b6b;font-weight:600;">In the portal you can:</p>
    <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;color:#4a4a4a;line-height:2;">
      <li>Chat directly with your team</li>
      <li>Track your projects and their status</li>
      <li>View and download your invoices</li>
    </ul>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr><td style="background:#042f28;border-radius:8px;">
        <a href="${link}" style="display:inline-block;padding:13px 26px;font-size:14px;font-weight:600;color:#fff;text-decoration:none;">Accept Invitation</a>
      </td></tr>
    </table>
    <p style="margin:0 0 6px;font-size:13px;color:#9a9a9a;">Or copy this link into your browser:</p>
    <p style="margin:0 0 20px;font-size:12px;color:#0a8c6a;word-break:break-all;">${link}</p>
    <p style="margin:0 0 8px;font-size:13px;color:#9a9a9a;">This invitation expires on <strong style="color:#6b6b6b;">${expiryDate}</strong>.</p>
    <p style="margin:0;font-size:13px;color:#c4c4c4;">If you weren't expecting this invitation, you can safely ignore this email.</p>`;
  return sharedEmailWrapper(body, "Accept your invitation to get started.");
}

function buildTeamInviteEmail({ link, expiresAt }: { link: string; expiresAt: Date }) {
  const expiryDate = fmtFullDate(expiresAt);
  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#0d0d0d;font-weight:500;">Hello,</p>
    <p style="margin:0 0 20px;font-size:15px;color:#4a4a4a;line-height:1.65;">You've been invited to join the <strong>ReachLogic team portal</strong>.</p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr><td style="background:#042f28;border-radius:8px;">
        <a href="${link}" style="display:inline-block;padding:13px 26px;font-size:14px;font-weight:600;color:#fff;text-decoration:none;">Accept Invitation</a>
      </td></tr>
    </table>
    <p style="margin:0 0 6px;font-size:13px;color:#9a9a9a;">Or copy this link into your browser:</p>
    <p style="margin:0 0 20px;font-size:12px;color:#0a8c6a;word-break:break-all;">${link}</p>
    <p style="margin:0 0 8px;font-size:13px;color:#9a9a9a;">This invitation expires on <strong style="color:#6b6b6b;">${expiryDate}</strong>.</p>
    <p style="margin:0;font-size:13px;color:#c4c4c4;">If you weren't expecting this invitation, you can safely ignore this email.</p>`;
  return sharedEmailWrapper(body, "Accept your invitation to get started.");
}

function buildColleagueInviteEmail({
  email,
  link,
  tempPassword,
  threadName,
}: {
  email: string;
  link: string;
  tempPassword: string;
  threadName: string;
}) {
  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#0d0d0d;font-weight:500;">Hello,</p>
    <p style="margin:0 0 20px;font-size:15px;color:#4a4a4a;line-height:1.65;">You've been added to the <strong>"${threadName}"</strong> thread on the ReachLogic portal. You can log in to view messages and communicate with the team.</p>
    <div style="background:#f9fafb;border-radius:8px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;color:#6b6b6b;">Your login credentials:</p>
      <p style="margin:0 0 8px;font-size:15px;color:#0d0d0d;"><strong>Email:</strong> ${email}</p>
      <p style="margin:0;font-size:15px;color:#0d0d0d;"><strong>Temporary password:</strong> ${tempPassword}</p>
    </div>
    <p style="margin:0 0 20px;font-size:13px;color:#d97706;"><em>Please change your password from your profile settings after your first login.</em></p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr><td style="background:#042f28;border-radius:8px;">
        <a href="${link}" style="display:inline-block;padding:13px 26px;font-size:14px;font-weight:600;color:#fff;text-decoration:none;">Log In Now</a>
      </td></tr>
    </table>`;
  return sharedEmailWrapper(body, `You've been added to the "${threadName}" thread.`);
}
