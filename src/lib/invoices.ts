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
    VALUES (1, 5001)
    ON CONFLICT (id)
    DO UPDATE SET "lastNum" = 
      CASE 
        WHEN invoice_counter."lastNum" < 5000 THEN 5000 + 1
        ELSE invoice_counter."lastNum" + 1 
      END
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
  orderId?: string;
  clientId?: string | null;
  serviceTitle: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  amount: number | null;
  currency?: string;
  billingName?: string | null;
  billingEmail?: string | null;
  billingCompany?: string | null;
  billingStreet?: string | null;
  billingCity?: string | null;
  billingState?: string | null;
  billingZip?: string | null;
  billingCountry?: string | null;
  billingAddress?: string | null;
  notes?: string | null;
  isOffPortal?: boolean;
}

/**
 * Auto-create an invoice when a new order is placed.
 * If amount is null (AWAITING_QUOTE) we create a $0 placeholder invoice
 * that can be updated later once the quote is agreed.
 */
export async function createAutoInvoice(opts: AutoInvoiceOptions): Promise<string> {
  const {
    orderId, clientId, serviceTitle, amount, currency = "USD",
    billingName, billingEmail, billingCompany,
    billingStreet, billingCity, billingState, billingZip, billingCountry,
    billingAddress: explicitAddress, notes, isOffPortal
  } = opts;

  const invoiceNumber = await getNextInvoiceNumber();
  const rate = amount ?? 0;

  // Build address string
  let billingAddress = explicitAddress || null;
  if (!billingAddress) {
    const addressParts = [billingStreet, billingCity, billingState, billingZip, billingCountry].filter(Boolean);
    if (addressParts.length > 0) billingAddress = addressParts.join(", ");
  }

  // Due date = endDate or 30 days from today
  let dueDate = opts.endDate;
  if (!dueDate) {
    dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
  }

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      dueDate,
      clientId: isOffPortal ? null : clientId,
      orderId: orderId ?? null,
      isLocked: false,
      currency,
      billingName: billingName || null,
      billingEmail: billingEmail || null,
      billingCompany: billingCompany || null,
      billingAddress,
      billingCountry: billingCountry || null,
      notes: notes ?? (amount == null ? "Amount to be confirmed once quote is agreed." : null),
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
