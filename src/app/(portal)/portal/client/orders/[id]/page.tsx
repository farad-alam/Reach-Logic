// src/app/(portal)/portal/client/orders/[id]/page.tsx
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Calendar, MessageSquare, Check } from "lucide-react";

export const metadata = { title: "Order Details" };

const statusLabels: Record<string, string> = {
  AWAITING_QUOTE: "Awaiting Approval",
  PENDING: "Awaiting Approval",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const statusColors: Record<string, string> = {
  AWAITING_QUOTE: "color-warning",
  PENDING: "color-warning",
  IN_PROGRESS: "color-progress",
  COMPLETED: "color-success",
  CANCELLED: "color-cancelled",
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(d));
}

function fmtShortDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(d));
}

export default async function ClientOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/portal/login");
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      invoices: { select: { id: true, invoiceNumber: true, isPaid: true } },
      thread: { select: { id: true, name: true } }
    },
  });

  if (!order || order.clientId !== session.user.id) notFound();

  // Timeline logic
  const isCompleted = order.status === "COMPLETED";
  const isInProgress = order.status === "IN_PROGRESS";
  const isPending = order.status === "AWAITING_QUOTE" || order.status === "PENDING";

  // Step 1: Submitted (Default)
  // Step 2: In Progress
  // Step 3: Completed
  const currentStep = isCompleted ? 3 : isInProgress ? 2 : 1;

  return (
    <div className="portal-page" style={{ maxWidth: 1200 }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/portal/client/orders" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--neutral-500)", textDecoration: "none", fontWeight: 500 }}>
          <ArrowLeft size={14} /> Back to My Orders
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--neutral-900)", marginBottom: 8, letterSpacing: "-0.01em" }}>
            {order.serviceTitle}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--neutral-500)" }}>
            <span>Order #{order.id.slice(0, 8).toUpperCase()}</span>
            <span>·</span>
            <span>Requested on {fmtDate(order.createdAt)}</span>
            {order.thread && (
              <>
                <span>·</span>
                <Link href={`/portal/client/messages?thread=${order.thread.id}`} style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--brand-dark)", textDecoration: "none", fontWeight: 600 }}>
                  <MessageSquare size={13} /> Thread: {order.thread.name}
                </Link>
              </>
            )}
          </div>
        </div>
        <div style={{ 
          background: "var(--warning-light)", 
          color: "var(--warning-dark)", 
          padding: "6px 14px", 
          borderRadius: 20, 
          fontSize: 13, 
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 6
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
          {statusLabels[order.status]}
        </div>
      </div>

      {/* Progress Timeline */}
      <div style={{ background: "#fff", padding: "32px 40px", borderRadius: 12, border: "1px solid var(--neutral-200)", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        
        {/* Step 1: Submitted */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: currentStep >= 1 ? "var(--brand-dark)" : "var(--neutral-100)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Check size={16} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--neutral-900)" }}>Submitted</div>
            <div style={{ fontSize: 11, color: "var(--neutral-500)" }}>{fmtShortDate(order.createdAt)}</div>
          </div>
        </div>

        <div style={{ height: 2, background: currentStep >= 2 ? "var(--brand-dark)" : "var(--neutral-100)", flex: 1, margin: "0 16px" }} />

        {/* Step 2: In Progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1.5 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: currentStep === 2 ? "var(--progress-light)" : currentStep > 2 ? "var(--brand-dark)" : "#f3f4f6", color: currentStep === 2 ? "var(--progress-dark)" : currentStep > 2 ? "#fff" : "var(--neutral-500)", border: currentStep === 2 ? "2px solid var(--progress-dark)" : "1px solid var(--neutral-200)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
            {currentStep > 2 ? <Check size={16} /> : "2"}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: currentStep >= 2 ? "var(--neutral-900)" : "var(--neutral-400)" }}>In Progress</div>
            <div style={{ fontSize: 11, color: "var(--neutral-500)" }}>{currentStep < 2 ? "After approval and payment" : ""}</div>
          </div>
        </div>

        <div style={{ height: 2, background: currentStep >= 3 ? "var(--brand-dark)" : "var(--neutral-100)", flex: 1, margin: "0 16px" }} />

        {/* Step 3: Completed */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: currentStep === 3 ? "var(--success-light)" : "#f3f4f6", color: currentStep === 3 ? "var(--success-dark)" : "var(--neutral-500)", border: currentStep === 3 ? "2px solid var(--success-dark)" : "1px solid var(--neutral-200)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
            {currentStep >= 3 ? <Check size={16} /> : "3"}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: currentStep === 3 ? "var(--neutral-900)" : "var(--neutral-400)" }}>Completed</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div style={{ background: "#fff", padding: "24px", borderRadius: 12, border: "1px solid var(--neutral-200)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--neutral-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Amount (USD)</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--neutral-900)", marginBottom: 8, letterSpacing: "-0.02em" }}>
            {order.amount ? fmt(Number(order.amount)) : "$0.00"}
          </div>
          <div style={{ fontSize: 12, color: "var(--neutral-400)" }}>
            Final amount is confirmed when the order is approved.
          </div>
        </div>
        
        <div style={{ background: "#fff", padding: "24px", borderRadius: 12, border: "1px solid var(--neutral-200)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--neutral-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Start Date</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, color: "var(--neutral-900)", fontWeight: 600 }}>
            <Calendar size={18} color="var(--neutral-500)" /> {fmtDate(order.startDate)}
          </div>
        </div>
        
        <div style={{ background: "#fff", padding: "24px", borderRadius: 12, border: "1px solid var(--neutral-200)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--neutral-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>End Date</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, color: "var(--neutral-900)", fontWeight: 600 }}>
            <Calendar size={18} color="var(--neutral-500)" /> {fmtDate(order.endDate)}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
        
        {/* Project Details */}
        <div style={{ background: "#fff", padding: "32px", borderRadius: 12, border: "1px solid var(--neutral-200)", alignSelf: "start", display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--neutral-900)", marginBottom: 20 }}>Project Details</div>
          <div style={{ fontSize: 14, color: "var(--neutral-600)", lineHeight: 1.6, whiteSpace: "pre-wrap", flex: 1 }}>
            {order.description}
          </div>
          
          <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid var(--neutral-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "var(--neutral-500)" }}>You can edit or cancel this request until it is approved.</span>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-outline" style={{ padding: "8px 16px", fontSize: 13 }} disabled={!isPending}>Edit Request</button>
              <button className="btn btn-outline" style={{ padding: "8px 16px", fontSize: 13, color: "var(--error)", borderColor: "var(--error-light)" }} disabled={!isPending}>Cancel Request</button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Related Invoices */}
          <div style={{ background: "#fff", padding: "24px", borderRadius: 12, border: "1px solid var(--neutral-200)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--neutral-900)", marginBottom: 16 }}>Related Invoices</div>
            {order.invoices.length === 0 ? (
              <div style={{ padding: 16, border: "1px dashed var(--neutral-200)", borderRadius: 8, fontSize: 13, color: "var(--neutral-500)" }}>
                No invoices yet. You'll get an invoice by email once this order is approved.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {order.invoices.map((inv) => (
                  <Link key={inv.id} href={`/portal/client/invoices/${inv.id}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--neutral-50)", borderRadius: 8, textDecoration: "none" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--neutral-900)" }}>{inv.invoiceNumber}</span>
                    {inv.isPaid ? (
                      <span style={{ color: "var(--success)", fontSize: 12, fontWeight: 700 }}>PAID</span>
                    ) : (
                      <span style={{ color: "var(--warning-dark)", fontSize: 12, fontWeight: 700 }}>UNPAID</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          {/* Start messaging */}
          <div style={{ background: "#fff", padding: "24px", borderRadius: 12, border: "1px solid var(--neutral-200)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--neutral-900)", marginBottom: 4 }}>Start messaging here</div>
            <div style={{ fontSize: 13, color: "var(--neutral-500)", marginBottom: 20 }}>Questions about this project? Chat with the team in its thread.</div>
            <Link href={`/portal/client/messages${order.threadId ? `?thread=${order.threadId}` : ''}`} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px", background: "var(--brand-dark)", border: "none", color: "#fff", fontSize: 14 }}>
              <MessageSquare size={16} /> Start Messaging here
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
