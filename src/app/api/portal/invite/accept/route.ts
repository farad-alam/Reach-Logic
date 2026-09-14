// src/app/api/portal/invite/accept/route.ts
import { NextRequest, NextResponse } from "next/server";
import { acceptInvitation } from "@/lib/invitations";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(1),
  fullName: z.string().min(2).max(80),
  password: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input. Please check your details." },
        { status: 400 }
      );
    }

    const { token, fullName, password } = parsed.data;
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await acceptInvitation(token, fullName, passwordHash);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, role: result.role });
  } catch (err) {
    console.error("[invite/accept]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
