// src/lib/invoices.ts — Invoice utilities
import { prisma } from "@/lib/db";

/** Get next global invoice number (INV-0001, INV-0002, ...) */
export async function getNextInvoiceNumber(): Promise<string> {
  // Atomic increment using a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Upsert the counter row (id=1 always)
    const counter = await tx.invoiceCounter.upsert({
      where: { id: 1 },
      create: { id: 1, lastNum: 1 },
      update: { lastNum: { increment: 1 } },
    });
    return counter.lastNum;
  });

  return `INV-${String(result).padStart(4, "0")}`;
}

/** Lock all invoices for an order when it's Completed or Cancelled */
export async function lockOrderInvoices(orderId: string) {
  await prisma.invoice.updateMany({
    where: { orderId },
    data: { isLocked: true },
  });
}

/** Calculate invoice total from line items */
export function calcInvoiceTotal(
  lineItems: Array<{ quantity: number; rate: number }>
): number {
  return lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
}
