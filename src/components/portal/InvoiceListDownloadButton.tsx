"use client";

import { Download } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Clicking this button opens the invoice detail page and immediately
 * triggers the PDF download (via sessionStorage flag picked up on the detail page).
 * This way the client-side html2canvas logic runs on the rendered detail page.
 */
export default function InvoiceListDownloadButton({
  invoiceId,
  invoiceNumber,
}: {
  invoiceId: string;
  invoiceNumber: string;
}) {
  const router = useRouter();

  const handleClick = () => {
    // Signal to the detail page that it should auto-trigger PDF download
    sessionStorage.setItem("autoDownloadInvoice", invoiceId);
    router.push(`/portal/client/invoices/${invoiceId}`);
  };

  return (
    <button
      onClick={handleClick}
      className="btn btn-outline btn-sm"
      title={`Download PDF for ${invoiceNumber}`}
      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
    >
      <Download size={13} />
      Download PDF
    </button>
  );
}
