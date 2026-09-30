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

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        notes: data.notes,
        isPaid: data.isPaid,
        paidAt: data.paidAt ? new Date(data.paidAt) : undefined,
        amountPaid: data.amountPaid ? parseFloat(data.amountPaid) : undefined,
        billingName: data.billingName,
        billingEmail: data.billingEmail,
        billingCompany: data.billingCompany,
        billingAddress: data.billingAddress,
        lineItems: data.lineItems ? {
          deleteMany: {},
          create: data.lineItems.map((item: any) => ({
            description: item.description,
            quantity: parseFloat(item.quantity),
            rate: parseFloat(item.rate),
            amount: parseFloat(item.quantity) * parseFloat(item.rate),
          })),
        } : undefined,
      },
      include: {
        lineItems: true,
      },
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error("Invoice edit error:", error);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}
