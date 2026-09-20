// src/lib/invoices.ts — Invoice utilities
import { prisma } from "@/lib/db";
import { neon } from "@neondatabase/serverless";

/** Get next global invoice number (INV-0001, INV-0002, ...) using atomic SQL */
export async function getNextInvoiceNumber(): Promise<string> {
  // Use raw SQL with RETURNING for atomic upsert + increment.
  // PrismaNeonHttp doesn't support interactive transactions, so we use
  // Neon's serverless driver directly for this one atomic operation.
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    INSERT INTO invoice_counter (id, "lastNum")
    VALUES (1, 1)
    ON CONFLICT (id)
    DO UPDATE SET "lastNum" = invoice_counter."lastNum" + 1
    RETURNING "lastNum"
  `;
  const lastNum = (rows[0] as { lastNum: number }).lastNum;
  return `INV-${String(lastNum).padStart(4, "0")}`;
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
