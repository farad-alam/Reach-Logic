"use client";
import { Printer, FileDown, FileSpreadsheet } from "lucide-react";
import type { StatementEntry, StatementTotals } from "./StatementClient";
import StatementPdfDocument from "./StatementPdfDocument";

function fmtDate(iso: string) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}

export default function StatementDownloadButtons({
  entries,
  totals,
  period,
  customFrom,
  customTo,
  currency,
}: {
  entries: StatementEntry[];
  totals: StatementTotals;
  period: string;
  customFrom: string;
  customTo: string;
  currency: string;
}) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("statement-pdf-layout");
    if (!element) return;
    
    element.style.display = "block"; // temporarily show it
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      
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

      pdf.save(`Statement_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Failed to generate PDF.");
    } finally {
      element.style.display = "none";
    }
  };

  const handleDownloadCSV = () => {
    const rows = [
      ["Date", "Client/Payer", "Reference", "Method", "Currency", "Amount"]
    ];

    entries.forEach(e => {
      rows.push([
        fmtDate(e.date),
        `"${e.clientName}"`,
        e.isRefund ? `${e.invoiceNumber} REFUND` : e.invoiceNumber,
        e.method || "",
        e.currency,
        e.isRefund ? `-${Math.abs(e.amount)}` : `${e.amount}`
      ]);
    });

    rows.push([]);
    if (totals["USD"]) {
      rows.push(["", "", "", "", "Total received (USD)", `${totals["USD"].received}`]);
      rows.push(["", "", "", "", "Refunds (USD)", `-${totals["USD"].refunds}`]);
      rows.push(["", "", "", "", "Net for period (USD)", `${totals["USD"].net}`]);
    }
    if (totals["BDT"]) {
      rows.push(["", "", "", "", "Total received (BDT)", `${totals["BDT"].received}`]);
      rows.push(["", "", "", "", "Refunds (BDT)", `-${totals["BDT"].refunds}`]);
      rows.push(["", "", "", "", "Net for period (BDT)", `${totals["BDT"].net}`]);
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Statement_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={handlePrint} className="btn btn-outline btn-sm" style={{ padding: "8px 14px", height: 38 }}>
          <Printer size={14} /> Print
        </button>
        <button onClick={handleDownloadPDF} className="btn btn-outline btn-sm" style={{ padding: "8px 14px", height: 38 }}>
          <FileDown size={14} /> Download PDF
        </button>
        <button onClick={handleDownloadCSV} className="btn btn-outline btn-sm" style={{ padding: "8px 14px", height: 38 }}>
          <FileSpreadsheet size={14} /> Export CSV
        </button>
      </div>
      
      {/* Hidden PDF layout used only for html2pdf generation */}
      <StatementPdfDocument 
        entries={entries} 
        totals={totals} 
        period={period} 
        customFrom={customFrom} 
        customTo={customTo} 
        currency={currency} 
      />
    </>
  );
}
