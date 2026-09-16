"use client";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

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

  return (
    <div className="portal-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div className="card" style={{ maxWidth: 480, textAlign: "center", padding: "40px 32px" }}>
        <AlertTriangle size={40} color="var(--danger)" style={{ margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--neutral-900)", marginBottom: 8 }}>
          Something went wrong
        </h2>
        <p style={{ fontSize: 14, color: "var(--neutral-500)", marginBottom: 24, lineHeight: 1.6 }}>
          {error.message || "An unexpected error occurred on this page."}
          {error.digest && (
            <span style={{ display: "block", marginTop: 8, fontSize: 12, color: "var(--neutral-400)", fontFamily: "monospace" }}>
              Error ID: {error.digest}
            </span>
          )}
        </p>
        <button onClick={reset} className="btn btn-primary" style={{ justifyContent: "center" }}>
          <RefreshCw size={14} /> Try Again
        </button>
      </div>
    </div>
  );
}
