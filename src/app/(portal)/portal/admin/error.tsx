"use client";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[portal/admin] error boundary caught:", error);
  }, [error]);

  const isDigestError = error.message?.includes("Server Components render");
  const displayMsg = isDigestError
    ? "An error occurred while loading this page. Please try again or return to the dashboard."
    : error.message || "An unexpected error occurred on this page.";

  return (
    <div className="portal-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div className="card" style={{ maxWidth: 480, textAlign: "center", padding: "40px 32px" }}>
        <AlertTriangle size={40} color="var(--danger)" style={{ margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--neutral-900)", marginBottom: 8 }}>
          Something went wrong
        </h2>
        <p style={{ fontSize: 14, color: "var(--neutral-500)", marginBottom: 24, lineHeight: 1.6 }}>
          {displayMsg}
          {error.digest && (
            <span style={{ display: "block", marginTop: 8, fontSize: 12, color: "var(--neutral-400)", fontFamily: "monospace" }}>
              Error ID: {error.digest}
            </span>
          )}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/portal/admin/clients" className="btn btn-outline">
            <ArrowLeft size={14} /> Back to Clients
          </Link>
          <button onClick={reset} className="btn btn-primary">
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
