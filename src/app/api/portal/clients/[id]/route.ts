// src/app/api/portal/clients/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const patchSchema = z.object({
  fullName: z.string().min(1).max(120).optional(),
  company: z.string().max(120).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  address: z.string().max(300).optional().nullable(),
  isActive: z.boolean().optional(),
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
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input.", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const client = await prisma.user.findUnique({ where: { id, role: "CLIENT" } });
    if (!client) return NextResponse.json({ error: "Client not found." }, { status: 404 });

    const updated = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: { id: true, fullName: true, email: true, isActive: true, company: true, phone: true, address: true },
    });

    return NextResponse.json({ ok: true, client: updated });
  } catch (err) {
    console.error("[clients/[id] PATCH]", err);
    return NextResponse.json({ error: "Failed to update client." }, { status: 500 });
  }
}
