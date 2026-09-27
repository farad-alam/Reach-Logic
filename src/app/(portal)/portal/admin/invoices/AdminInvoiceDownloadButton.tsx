"use client";
import { Download } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Admin version — navigates to admin invoice detail page and triggers PDF download.
 */
export default function AdminInvoiceDownloadButton({
  invoiceId,
  invoiceNumber,
}: {
  invoiceId: string;
  invoiceNumber: string;
}) {
  const router = useRouter();

  const handleClick = () => {
    sessionStorage.setItem("autoDownloadInvoice", invoiceId);
    router.push(`/portal/admin/invoices/${invoiceId}`);
  };

  return (
    <button
      onClick={handleClick}
      className="btn btn-outline btn-sm"
      title={`Download PDF for ${invoiceNumber}`}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}
    >
      <Download size={13} /> PDF
    </button>
  );
}
