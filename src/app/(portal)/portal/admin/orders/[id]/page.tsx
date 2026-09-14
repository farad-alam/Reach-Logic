// src/app/(portal)/portal/admin/orders/[id]/page.tsx
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Calendar, CheckCircle2, User } from "lucide-react";
import OrderStatusForm from "./OrderStatusForm";
import OrderQuoteForm from "./OrderQuoteForm";

export const metadata = { title: "Manage Order" };

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}
function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(d));
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      client: { select: { fullName: true, email: true } },
      invoices: { select: { id: true, invoiceNumber: true, isPaid: true } }
    },
  });

  if (!order) notFound();

  return (
    <div className="portal-page">
      <div style={{ marginBottom: 20 }}>
        <Link href="/portal/admin/orders" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--neutral-500)", textDecoration: "none" }}>
          <ArrowLeft size={14} /> Back to Orders
        </Link>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-header-title">Manage Order: {order.serviceTitle}</h1>
          <p className="page-header-sub">Requested on {fmtDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--neutral-500)", textTransform: "uppercase", marginBottom: 8 }}>Client</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, color: "var(--neutral-900)", fontWeight: 500 }}>
            <User size={16} color="var(--brand-accent)" /> {order.client.fullName ?? order.client.email}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--neutral-500)", textTransform: "uppercase", marginBottom: 8 }}>Target Start</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, color: "var(--neutral-900)", fontWeight: 500 }}>
            <Calendar size={16} color="var(--neutral-400)" /> {fmtDate(order.startDate)}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--neutral-500)", textTransform: "uppercase", marginBottom: 8 }}>Target Completion</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, color: "var(--neutral-900)", fontWeight: 500 }}>
            <Calendar size={16} color="var(--neutral-400)" /> {fmtDate(order.endDate)}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {order.amount === null ? (
            <div className="card" style={{ border: "1px solid var(--warning)", background: "#fffbeb" }}>
              <OrderQuoteForm orderId={order.id} />
            </div>
          ) : (
            <div className="card">
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--neutral-500)", textTransform: "uppercase", marginBottom: 8 }}>Quoted Amount</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--neutral-900)" }}>
                {fmt(Number(order.amount))}
              </div>
            </div>
          )}

          <div className="card">
            <OrderStatusForm orderId={order.id} currentStatus={order.status} />
          </div>

          <div className="card">
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--neutral-900)", marginBottom: 16 }}>Project Requirements</div>
            <div style={{ fontSize: 14, color: "var(--neutral-700)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {order.description}
            </div>
          </div>
        </div>

        <div className="card" style={{ alignSelf: "start" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--neutral-900)" }}>Invoices</div>
            <Link href={`/portal/admin/invoices/new?orderId=${order.id}`} className="btn btn-outline btn-sm">
              Create Invoice
            </Link>
          </div>
          
          {order.invoices.length === 0 ? (
            <div className="empty-state" style={{ padding: "24px 0" }}>
              <div style={{ fontSize: 13, color: "var(--neutral-400)" }}>No invoices generated yet.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {order.invoices.map((inv) => (
                <Link key={inv.id} href={`/portal/admin/invoices/${inv.id}`} className="btn btn-outline" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{inv.invoiceNumber}</span>
                  {inv.isPaid ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--success)", fontSize: 12, fontWeight: 600 }}><CheckCircle2 size={14} /> Paid</span>
                  ) : (
                    <span style={{ color: "var(--warning)", fontSize: 12, fontWeight: 600 }}>Unpaid</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
