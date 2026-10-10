// src/app/api/portal/invoices/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getNextInvoiceNumber } from "@/lib/invoices";
import { notifyInvoiceCreated, sendNewInvoiceEmail } from "@/lib/notifications";

const schema = z.object({
  // Client selection
  clientId: z.string().optional(),         // empty = Off-Portal
  isOffPortal: z.boolean().default(false),
  threadId: z.string().optional(),          // required if portal client

  // Billing info (always present)
  billingName: z.string().min(1),
  billingEmail: z.string().email(),
  billingCompany: z.string().optional(),
  billingCountry: z.string().min(1),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),

  // Invoice details
  projectTitle: z.string().min(1).max(150),
  projectDescription: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),                      // also = dueDate
  amount: z.number().positive(),
  currency: z.enum(["USD", "BDT"]).default("USD"),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data provided.", details: parsed.error.format() }, { status: 400 });
    }

    const { 
      clientId, isOffPortal, threadId, 
      billingName, billingEmail, billingCompany, billingCountry, billingCity, billingState, 
      projectTitle, projectDescription, startDate, endDate, amount, currency, notes 
    } = parsed.data;

    const billingAddress = [billingCity, billingState, billingCountry].filter(Boolean).join(", ");

    if (!isOffPortal && !clientId) {
      return NextResponse.json({ error: "Client is required for portal invoices." }, { status: 400 });
    }
    if (!isOffPortal && !threadId) {
      return NextResponse.json({ error: "Thread is required for portal invoices." }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return NextResponse.json({ error: "End date must be on or after start date." }, { status: 400 });
    }

    const invoiceNumber = await getNextInvoiceNumber();

    // 1. Create Order
    const order = await prisma.order.create({
      data: {
        serviceTitle: projectTitle,
        description: projectDescription,
        startDate: start,
        endDate: end,
        amount,
        currency,
        status: "PENDING",
        clientId: isOffPortal ? null : (clientId as string),
        threadId: isOffPortal ? null : threadId,
        isOffPortal,
        offPortalName: isOffPortal ? billingName : null,
        offPortalEmail: isOffPortal ? billingEmail : null,
        offPortalCompany: isOffPortal ? billingCompany : null,
        offPortalAddress: isOffPortal ? billingAddress : null,
        offPortalCountry: isOffPortal ? billingCountry : null,
        createdById: session.user.id,
      }
    });

    // 2. Create Invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        dueDate: end,
        clientId: isOffPortal ? null : (clientId as string),
        orderId: order.id,
        currency,
        billingName,
        billingEmail,
        billingCompany: billingCompany || null,
        billingAddress,
        billingCountry,
        notes: notes || null,
      }
    });

    // 3. Create Line Item
    await prisma.invoiceLineItem.create({
      data: {
        invoiceId: invoice.id,
        description: projectTitle,
        quantity: 1,
        rate: amount,
        amount,
      }
    });

    // 4. Thread Post for Portal Client
    if (!isOffPortal && threadId) {
      const monthYear = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(end);
      await prisma.message.create({
        data: {
          threadId,
          body: `🧾 New invoice created: ${projectTitle}, ${monthYear}`,
          type: "SYSTEM",
          metadata: { invoiceId: invoice.id, orderId: order.id, event: "invoice_created" },
        }
      });
    }

    // 5. Send Email
    await sendNewInvoiceEmail(invoice.id);

    // 6. In-app Notification for Portal Client
    if (!isOffPortal && clientId) {
      await notifyInvoiceCreated(invoice.id);
    }

    return NextResponse.json({ ok: true, invoiceId: invoice.id, orderId: order.id });
  } catch (error) {
    console.error("[invoices/create]", error);
    const msg = error instanceof Error ? error.message : "Failed to create invoice.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
