import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as bcrypt from "bcryptjs";

export async function GET() {
  try {
    const email = "admin@reachlogic.net";
    const existing = await prisma.user.findUnique({ where: { email } });
    
    if (existing) {
      return NextResponse.json({ message: "Super Admin already exists!" });
    }
    
    const passwordHash = await bcrypt.hash("Admin123!", 12);
    
    await prisma.user.create({
      data: {
        email,
        fullName: "Super Admin",
        role: "SUPER_ADMIN",
        passwordHash,
        isActive: true,
      }
    });
    
    return NextResponse.json({ message: "✅ Super Admin created successfully!", email, password: "You know that" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
