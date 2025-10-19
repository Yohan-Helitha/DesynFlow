// utils/pdfGenerator.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Brand Colors
const COLORS = {
  primary: [43, 27, 14],      // #2B1B0E - Dark Brown
  secondary: [103, 70, 54],   // #674636 - Medium Brown
  accent: [170, 179, 150],    // #AAB396 - Sage Green
  white: [255, 255, 255],
  lightGray: [245, 245, 245],
  darkGray: [64, 64, 64],
  text: [43, 27, 14]
};

export const generatePDF = (columns, rows, reportTitle, extraOptions = {}) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a3"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ====================
  // HEADER SECTION
  // ====================
  
  // Header background bar
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 45, "F");

  // Company name with accent color underline
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("DesynFlow", 20, 18);
  
  // Accent underline
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(1);
  doc.line(20, 21, 75, 21);

  // Tagline
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.accent);
  doc.text("WAREHOUSE MANAGEMENT SYSTEM", 20, 27);

  // Contact information - right aligned
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.white);
  doc.setFont("helvetica", "normal");
  
  const contactInfo = [
    "123 Main Street, Colombo, Sri Lanka",
    "Tel: +94 11 1234567",
    "Email: info@desynflow.com"
  ];
  
  let yPos = 14;
  contactInfo.forEach(info => {
    const textWidth = doc.getTextWidth(info);
    doc.text(info, pageWidth - textWidth - 20, yPos);
    yPos += 5;
  });

  // Date and time stamp
  const currentDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.accent);
  const dateWidth = doc.getTextWidth(`Generated: ${currentDate}`);
  doc.text(`Generated: ${currentDate}`, pageWidth - dateWidth - 20, 35);

  // ====================
  // REPORT TITLE SECTION
  // ====================
  
  // Title background
  doc.setFillColor(...COLORS.accent);
  doc.rect(20, 52, pageWidth - 40, 12, "F");

  // Report title
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(reportTitle.toUpperCase(), 25, 60);

  // ====================
  // TABLE SECTION
  // ====================
  
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 70,
    theme: "striped",
    headStyles: {
      fillColor: COLORS.secondary,
      textColor: COLORS.white,
      fontSize: 11,
      fontStyle: "bold",
      halign: "left",
      cellPadding: 4
    },
    alternateRowStyles: {
      fillColor: [250, 250, 248]
    },
    bodyStyles: {
      textColor: COLORS.text,
      fontSize: 10,
      cellPadding: 3
    },
    columnStyles: {
      0: { fontStyle: "bold", textColor: COLORS.secondary }
    },
    margin: { left: 20, right: 20 },
    didDrawPage: function(data) {
      // Footer section
      const footerY = pageHeight - 15;
      
      // Footer line
      doc.setDrawColor(...COLORS.accent);
      doc.setLineWidth(0.5);
      doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
      
      // Page number
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.secondary);
      doc.setFont("helvetica", "normal");
      const pageNum = `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${doc.internal.getNumberOfPages()}`;
      doc.text(pageNum, 20, footerY);
      
      // Footer text - right aligned
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.darkGray);
      const footerText = "Confidential - For Internal Use Only";
      const footerWidth = doc.getTextWidth(footerText);
      doc.text(footerText, pageWidth - footerWidth - 20, footerY);
    },
    ...extraOptions,
  });

  // Update page count after table is drawn
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Update page numbers
    const footerY = pageHeight - 15;
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.secondary);
    doc.setFont("helvetica", "normal");
    const pageNum = `Page ${i} of ${pageCount}`;
    
    // Clear previous page number area and redraw
    doc.setFillColor(255, 255, 255);
    doc.rect(18, footerY - 4, 30, 5, "F");
    doc.setTextColor(...COLORS.secondary);
    doc.text(pageNum, 20, footerY);
  }

  // ====================
  // SAVE PDF
  // ====================
  
  const fileName = `${reportTitle.replace(/\s/g, "_")}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

// Optional: Export function for adding summary boxes
export const addSummarySection = (doc, summaryData, startY) => {
  const boxWidth = 60;
  const boxHeight = 20;
  const spacing = 10;
  let xPos = 20;

  summaryData.forEach((item, index) => {
    // Box background
    doc.setFillColor(...COLORS.lightGray);
    doc.roundedRect(xPos, startY, boxWidth, boxHeight, 2, 2, "F");
    
    // Border
    doc.setDrawColor(...COLORS.accent);
    doc.setLineWidth(0.5);
    doc.roundedRect(xPos, startY, boxWidth, boxHeight, 2, 2, "S");
    
    // Label
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.secondary);
    doc.setFont("helvetica", "normal");
    doc.text(item.label, xPos + 5, startY + 8);
    
    // Value
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.primary);
    doc.setFont("helvetica", "bold");
    doc.text(item.value.toString(), xPos + 5, startY + 16);
    
    xPos += boxWidth + spacing;
  });
  
  return startY + boxHeight + 10;
};