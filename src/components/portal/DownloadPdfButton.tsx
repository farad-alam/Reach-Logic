"use client";

import { useState, useEffect } from "react";
import { Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Props {
  targetId: string;
  filename: string;
  invoiceId?: string; // if set, listens for autoDownload signal from invoice list
}

export default function DownloadPdfButton({ targetId, filename, invoiceId }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);

  // Auto-trigger download if we arrived here from the invoice list "Download PDF" button
  useEffect(() => {
    if (!invoiceId) return;
    const stored = sessionStorage.getItem("autoDownloadInvoice");
    if (stored === invoiceId) {
      sessionStorage.removeItem("autoDownloadInvoice");
      // Small delay to ensure the page is fully rendered before capture
      const timer = setTimeout(() => handleDownload(), 800);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const element = document.getElementById(targetId);
      if (!element) {
        alert("Invoice element not found");
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // If content overflows one A4 page, split across multiple pages
      const pageHeight = pdf.internal.pageSize.getHeight();
      if (pdfHeight <= pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      } else {
        let yOffset = 0;
        while (yOffset < pdfHeight) {
          pdf.addImage(imgData, "PNG", 0, -yOffset, pdfWidth, pdfHeight);
          yOffset += pageHeight;
          if (yOffset < pdfHeight) pdf.addPage();
        }
      }

      pdf.save(filename);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="btn btn-outline btn-sm"
      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
    >
      {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
      {isDownloading ? "Generating PDF…" : "Download PDF"}
    </button>
  );
}
