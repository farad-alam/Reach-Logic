import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

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

    const order = await prisma.order.update({
      where: { id },
      data: {
        serviceTitle: data.serviceTitle,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        amount: data.amount ? parseFloat(data.amount) : null,
        status: data.status as OrderStatus,
        billingStreet: data.billingStreet,
        billingCity: data.billingCity,
        billingState: data.billingState,
        billingZip: data.billingZip,
        billingCountry: data.billingCountry,
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Order edit error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
