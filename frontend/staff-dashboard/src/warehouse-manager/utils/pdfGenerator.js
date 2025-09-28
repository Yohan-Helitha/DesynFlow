// utils/pdfGenerator.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePDF = (columns, rows, reportTitle, extraOptions = {}) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a3" 
  });

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("DesynFlow", 14, 20);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Address: 123, Main Street, Colombo, Sri Lanka", 14, 28);
  doc.text("Phone: +94 11 1234567 | Email: info@company.com", 14, 34);

  doc.setLineWidth(0.5);
  doc.line(14, 38, 196, 38);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(reportTitle, 14, 48);

  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 55,
    theme: "grid",
    headStyles: { fillColor: [255, 193, 7] },
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
    ...extraOptions,
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() - 30,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  doc.save(`${reportTitle.replace(/\s/g, "_")}.pdf`);
};
