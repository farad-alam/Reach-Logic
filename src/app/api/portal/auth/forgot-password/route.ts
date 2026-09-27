import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "ReachLogic <portal@reachlogic.net>";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://reachlogic.net";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      // Don't leak whether the user exists or not
      return NextResponse.json({ ok: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    // We'll use the VerificationToken table to store password reset tokens temporarily
    await prisma.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: email.toLowerCase(),
          token, // upserting with a random token won't match, so it'll create. Wait, we should delete old tokens first.
        }
      },
      update: {},
      create: {
        identifier: email.toLowerCase(),
        token,
        expires,
      }
    }).catch(async () => {
      // If upsert fails due to composite key stuff, just delete old and create new
      await prisma.verificationToken.deleteMany({
        where: { identifier: email.toLowerCase() }
      });
      await prisma.verificationToken.create({
        data: {
          identifier: email.toLowerCase(),
          token,
          expires,
        }
      });
    });

    // To be perfectly safe, since upsert can fail with Neon, we just delete and create:
    await prisma.verificationToken.deleteMany({
      where: { identifier: email.toLowerCase() }
    });
    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        expires,
      }
    });

    const link = `${BASE_URL}/portal/reset-password?token=${token}`;

    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Reset your ReachLogic password",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #042f28;">Password Reset Request</h2>
          <p>We received a request to reset your password for your ReachLogic account.</p>
          <p>Click the button below to choose a new password:</p>
          <a href="${link}" style="display: inline-block; background: #0aad92; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Reset Password</a>
          <p style="font-size: 14px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
          <p style="font-size: 12px; color: #999; margin-top: 40px;">This link expires in 24 hours.</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[forgot-password]", error);
    return NextResponse.json({ error: "Failed to process request." }, { status: 500 });
  }
}
