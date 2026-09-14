// src/lib/invitations.ts — Invitation helpers
import { prisma } from "@/lib/db";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "ReachLogic <portal@reachlogic.net>";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://reachlogic.net";

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
    from: FROM,
    to: email,
    subject: "You're invited to the ReachLogic Client Portal",
    html: buildInviteEmail({ link, role: "client", expiryDays: 7 }),
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
    from: FROM,
    to: email,
    subject: "You're invited to join the ReachLogic team",
    html: buildInviteEmail({ link, role: "team member", expiryDays: 7 }),
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
  passwordHash: string
): Promise<{ ok: boolean; userId?: string; role?: string; error?: string }> {
  const check = await validateInviteToken(token);
  if (!check.valid || !check.invitation) return { ok: false, error: check.reason };

  const { invitation } = check;

  // Create user
  const user = await prisma.user.create({
    data: {
      email: invitation.email,
      fullName: fullName.trim(),
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

// ─── Email template ───────────────────────────────────────────────────────────
function buildInviteEmail({
  link,
  role,
  expiryDays,
}: {
  link: string;
  role: string;
  expiryDays: number;
}) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#042f28;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-height:100vh;background:#042f28;">
    <tr><td align="center" style="padding:48px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:14px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="background:#042f28;padding:28px 36px;text-align:center;">
          <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.03em;">ReachLogic</span>
          <span style="display:inline-block;margin-left:8px;background:rgba(18,196,148,0.15);color:#12c494;font-size:11px;font-weight:600;padding:2px 8px;border-radius:4px;letter-spacing:0.04em;text-transform:uppercase;">Portal</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px 36px;">
          <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#0d0d0d;letter-spacing:-0.02em;">You're invited!</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#6b6b6b;line-height:1.6;">
            You've been invited to join the <strong>ReachLogic portal</strong> as a ${role}.
            Click the button below to set up your account.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
            <tr><td style="background:#042f28;border-radius:8px;">
              <a href="${link}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.01em;">
                Accept Invitation →
              </a>
            </td></tr>
          </table>
          <p style="margin:0 0 8px;font-size:13px;color:#9a9a9a;">Or copy this link into your browser:</p>
          <p style="margin:0 0 28px;font-size:12px;color:#0a8c6a;word-break:break-all;">${link}</p>
          <hr style="border:none;border-top:1px solid #e5e5e5;margin:0 0 20px;">
          <p style="margin:0;font-size:12px;color:#c4c4c4;line-height:1.5;">
            This invitation expires in ${expiryDays} days. If you didn't expect this email, you can safely ignore it.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
