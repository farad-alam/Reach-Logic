import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await req.json();

    const user = await prisma.user.update({
      where: { id },
      data: {
        fullName: data.fullName,
        email: data.email,
        company: data.company,
        phone: data.phone,
        address: data.address,
        state: data.state,
        country: data.country,
        timezone: data.timezone,
        isActive: data.isActive,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Client edit error:", error);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}
