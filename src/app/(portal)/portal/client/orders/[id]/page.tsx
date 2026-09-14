// src/app/(portal)/portal/client/orders/[id]/page.tsx
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Calendar, Info, CheckCircle2 } from "lucide-react";

export const metadata = { title: "Order Details" };

const statusColors: Record<string, string> = {
  AWAITING_QUOTE: "badge badge-awaiting",
  PENDING: "badge badge-pending",
  IN_PROGRESS: "badge badge-progress",
  COMPLETED: "badge badge-completed",
  CANCELLED: "badge badge-cancelled",
};
const statusLabels: Record<string, string> = {
  AWAITING_QUOTE: "Awaiting Quote",
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}
function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(d));
}

export default async function ClientOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { invoices: { select: { id: true, invoiceNumber: true, isPaid: true } } },
  });

  if (!order || order.clientId !== session.user.id) notFound();

  return (
    <div className="portal-page">
      <div style={{ marginBottom: 20 }}>
        <Link href="/portal/client/orders" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--neutral-500)", textDecoration: "none" }}>
          <ArrowLeft size={14} /> Back to Orders
        </Link>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-header-title">{order.serviceTitle}</h1>
          <p className="page-header-sub">Requested on {fmtDate(order.createdAt)}</p>
        </div>
        <span className={statusColors[order.status]} style={{ fontSize: 14, padding: "6px 12px" }}>
          {statusLabels[order.status]}
        </span>
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card">
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--neutral-500)", textTransform: "uppercase", marginBottom: 8 }}>Quoted Amount</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--neutral-900)" }}>
            {order.amount ? fmt(Number(order.amount)) : <span style={{ color: "var(--neutral-400)", fontSize: 18 }}>Pending review...</span>}
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
        <div className="card" style={{ alignSelf: "start" }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--neutral-900)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Info size={18} color="var(--brand-accent)" /> Project Details
          </div>
          <div style={{ fontSize: 14, color: "var(--neutral-700)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {order.description}
          </div>
        </div>

        <div className="card" style={{ alignSelf: "start" }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--neutral-900)", marginBottom: 16 }}>Related Invoices</div>
          {order.invoices.length === 0 ? (
            <div style={{ fontSize: 14, color: "var(--neutral-500)", fontStyle: "italic" }}>No invoices generated for this order yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {order.invoices.map((inv) => (
                <Link key={inv.id} href={`/portal/client/invoices/${inv.id}`} className="btn btn-outline" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
          
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--neutral-100)" }}>
            <div style={{ fontSize: 14, color: "var(--neutral-600)", marginBottom: 12 }}>Need to discuss this project?</div>
            <Link href="/portal/client/messages" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
              Message our team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
