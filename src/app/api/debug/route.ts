// src/app/api/debug/route.ts — TEMPORARY diagnostic route
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const results: Record<string, unknown> = {};

  // 1. Test auth
  try {
    const session = await auth();
    results.auth = session
      ? { ok: true, userId: session.user?.id, role: (session.user as { role?: string }).role }
      : { ok: false, error: "No session" };
  } catch (e: unknown) {
    results.auth = { ok: false, error: (e as Error).message, stack: (e as Error).stack?.split("\n").slice(0, 5) };
  }

  // 2. Test basic prisma query
  try {
    const count = await prisma.user.count();
    results.prisma_basic = { ok: true, userCount: count };
  } catch (e: unknown) {
    results.prisma_basic = { ok: false, error: (e as Error).message, stack: (e as Error).stack?.split("\n").slice(0, 5) };
  }

  // 3. Test the EXACT client detail query
  const clientId = req.nextUrl.searchParams.get("clientId") || "cmu2b5pxy000004jnm4t9450i";
  try {
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      include: {
        clientOrders: {
          orderBy: { createdAt: "desc" },
          select: { id: true, serviceTitle: true, status: true, amount: true, createdAt: true },
        },
        clientInvoices: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { lineItems: { select: { amount: true } } },
        },
        clientThread: { select: { id: true } },
      },
    });
    results.client_query = client
      ? { ok: true, email: client.email, orders: client.clientOrders.length, invoices: client.clientInvoices.length }
      : { ok: false, error: "Not found" };
  } catch (e: unknown) {
    results.client_query = { ok: false, error: (e as Error).message, stack: (e as Error).stack?.split("\n").slice(0, 5) };
  }

  // 4. Test threads query (used by messages page)
  try {
    const threads = await prisma.thread.findMany({
      take: 5,
      include: {
        client: { select: { id: true, fullName: true, email: true } },
        messages: { take: 1, orderBy: { createdAt: "desc" } },
      },
    });
    results.threads_query = { ok: true, count: threads.length };
  } catch (e: unknown) {
    results.threads_query = { ok: false, error: (e as Error).message, stack: (e as Error).stack?.split("\n").slice(0, 5) };
  }

  // 5. Environment check
  results.env = {
    hasDbUrl: !!process.env.DATABASE_URL,
    dbUrlPrefix: process.env.DATABASE_URL?.slice(0, 30) + "...",
    nodeEnv: process.env.NODE_ENV,
  };

  return NextResponse.json(results, { status: 200 });
}
