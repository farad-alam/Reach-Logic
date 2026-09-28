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

interface AutoInvoiceOptions {
  orderId: string;
  clientId: string;
  serviceTitle: string;
  amount: number | null; // null = awaiting quote → $0 placeholder
  billingName?: string | null;
  billingEmail?: string | null;
  billingCompany?: string | null;
  billingStreet?: string | null;
  billingCity?: string | null;
  billingState?: string | null;
  billingZip?: string | null;
  billingCountry?: string | null;
}

/**
 * Auto-create an invoice when a new order is placed.
 * If amount is null (AWAITING_QUOTE) we create a $0 placeholder invoice
 * that can be updated later once the quote is agreed.
 */
export async function createAutoInvoice(opts: AutoInvoiceOptions): Promise<string> {
  const {
    orderId, clientId, serviceTitle, amount,
    billingName, billingEmail, billingCompany,
    billingStreet, billingCity, billingState, billingZip, billingCountry,
  } = opts;

  const invoiceNumber = await getNextInvoiceNumber();
  const rate = amount ?? 0;

  // Build address string
  const addressParts = [billingStreet, billingCity, billingState, billingZip, billingCountry].filter(Boolean);
  const billingAddress = addressParts.length > 0 ? addressParts.join(", ") : null;

  // Due date = 30 days from today
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      dueDate,
      clientId,
      orderId,
      isLocked: false,
      billingName: billingName || null,
      billingEmail: billingEmail || null,
      billingCompany: billingCompany || null,
      billingAddress,
      notes: amount == null ? "Amount to be confirmed once quote is agreed." : null,
    },
  });

  await prisma.invoiceLineItem.create({
    data: {
      invoiceId: invoice.id,
      description: serviceTitle,
      quantity: 1,
      rate,
      amount: rate,
    },
  });

  return invoice.id;
}
