// src/app/api/portal/invoices/statement/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

function getDateRange(period: string, from?: string, to?: string): { start: Date; end: Date } {
  const now = new Date();
  if (period === "this_month") {
    return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59) };
  } else if (period === "last_month") {
    return { start: new Date(now.getFullYear(), now.getMonth() - 1, 1), end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59) };
  } else if (period === "this_year") {
    return { start: new Date(now.getFullYear(), 0, 1), end: new Date(now.getFullYear(), 11, 31, 23, 59, 59) };
  } else if (period === "custom" && from && to) {
    return { start: new Date(from), end: new Date(new Date(to).setHours(23, 59, 59)) };
  }
  // all_time
  return { start: new Date("2000-01-01"), end: new Date("2100-01-01") };
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? "this_month";
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const clientId = searchParams.get("clientId") ?? "all";
  const currency = searchParams.get("currency") ?? "all";
  const search = searchParams.get("search") ?? "";

  const { start, end } = getDateRange(period, from, to);

  // Build invoice filter
  const invoiceWhere: Record<string, unknown> = { deletedAt: null };
  if (clientId !== "all") invoiceWhere.clientId = clientId;
  if (currency !== "all") invoiceWhere.currency = currency;

  // Fetch InvoicePayment rows
  const payments = await prisma.invoicePayment.findMany({
    where: {
      paidAt: { gte: start, lte: end },
      invoice: invoiceWhere,
    },
    orderBy: { paidAt: "desc" },
    include: {
      invoice: {
        select: {
          invoiceNumber: true,
          currency: true,
          billingName: true,
          client: { select: { fullName: true, email: true } },
        },
      },
    },
  });

  // Also collect fully-paid invoices that have NO InvoicePayment rows yet (backfill)
  const paidInvoices = await prisma.invoice.findMany({
    where: {
      ...invoiceWhere,
      isPaid: true,
      paidAt: { gte: start, lte: end },
      payments: { none: {} }, // no payment rows yet
    },
    include: {
      client: { select: { fullName: true, email: true } },
      lineItems: true,
    },
  });

  // Shape entries from InvoicePayment rows
  const entries = payments.map((p) => {
    const clientName = p.invoice.client?.fullName || p.invoice.client?.email || p.invoice.billingName || "Unknown";
    const effectiveCurrency = p.invoice.currency || p.currency;
    return {
      id: p.id,
      date: p.paidAt.toISOString(),
      clientName,
      invoiceNumber: p.invoice.invoiceNumber,
      isRefund: p.isRefund,
      method: p.method,
      currency: effectiveCurrency,
      amount: Number(p.amount),
      notes: p.notes,
    };
  });

  // Shape backfill entries for old paid invoices
  const backfillEntries = paidInvoices.map((inv) => {
    const total = inv.lineItems.reduce((s, i) => s + Number(i.amount), 0);
    const clientName = inv.client?.fullName || inv.client?.email || inv.billingName || "Unknown";
    return {
      id: `bf-${inv.id}`,
      date: (inv.paidAt ?? inv.updatedAt).toISOString(),
      clientName,
      invoiceNumber: inv.invoiceNumber,
      isRefund: false,
      method: null as string | null,
      currency: inv.currency || "USD",
      amount: total,
      notes: null as string | null,
    };
  });

  const allEntries = [...entries, ...backfillEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Apply search filter
  const filtered = search
    ? allEntries.filter((e) =>
        e.clientName.toLowerCase().includes(search.toLowerCase()) ||
        e.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        (e.method ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : allEntries;

  // Apply currency filter (for backfill which may not have been filtered by DB)
  const currencyFiltered = currency !== "all" ? filtered.filter((e) => e.currency === currency) : filtered;

  // Compute totals per currency
  const totalsByCurrency: Record<string, { received: number; refunds: number; net: number }> = {};
  for (const e of currencyFiltered) {
    if (!totalsByCurrency[e.currency]) totalsByCurrency[e.currency] = { received: 0, refunds: 0, net: 0 };
    if (e.isRefund) {
      totalsByCurrency[e.currency].refunds += Math.abs(e.amount);
    } else {
      totalsByCurrency[e.currency].received += e.amount;
    }
  }
  for (const c of Object.keys(totalsByCurrency)) {
    totalsByCurrency[c].net = totalsByCurrency[c].received - totalsByCurrency[c].refunds;
  }

  const paymentCount = currencyFiltered.filter((e) => !e.isRefund).length;
  const refundCount = currencyFiltered.filter((e) => e.isRefund).length;

  // Fetch all clients for the filter dropdown
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT", deletedAt: null },
    select: { id: true, fullName: true, email: true },
    orderBy: { fullName: "asc" },
  });

  return NextResponse.json({
    entries: currencyFiltered,
    totals: totalsByCurrency,
    entryCount: currencyFiltered.length,
    paymentCount,
    refundCount,
    clients,
  });
}
