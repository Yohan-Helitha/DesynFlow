import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Generate a PDF file for a quotation and return a relative URL to the file
export async function generateQuotationPdf(quotation) {
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  const quotesDir = path.join(uploadsDir, 'quotations');
  if (!fs.existsSync(quotesDir)) {
    fs.mkdirSync(quotesDir, { recursive: true });
  }

  const safeProject = String(quotation.projectId);
  const fileName = `quotation_${safeProject}_${quotation.estimateVersion || 'v0'}_${quotation.version || 1}.pdf`;
  const filePath = path.join(quotesDir, fileName);

  // Build PDF contents
  await new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(18).text('Quotation', { align: 'center' }).moveDown(0.5);
      doc.fontSize(10).text(`Project: ${safeProject}`);
      doc.text(`Estimate Version: ${quotation.estimateVersion}`);
      doc.text(`Quotation Version: ${quotation.version}`);
      doc.text(`Date: ${new Date().toISOString().split('T')[0]}`);
      if (quotation.remarks) {
        doc.moveDown(0.5).fontSize(10).text(`Remarks: ${quotation.remarks}`);
      }

      const addTable = (title, columns, rows) => {
        if (!rows || !rows.length) return;
        doc.moveDown(1);
        doc.fontSize(12).text(title, { underline: true }).moveDown(0.5);
        doc.fontSize(10);
        // Header
        doc.text(columns.join(' | '));
        doc.moveDown(0.2);
        rows.forEach((r) => {
          doc.text(r.join(' | '));
        });
      };

      // Labor
      const laborRows = (quotation.laborItems || []).map(i => [i.task, String(i.hours), toMoney(i.rate), toMoney(i.total)]);
      addTable('Labor Items', ['Task', 'Hours', 'Rate', 'Total'], laborRows);

      // Materials
      const materialRows = (quotation.materialItems || []).map(i => [String(i.materialId || ''), i.description, String(i.quantity), toMoney(i.unitPrice), toMoney(i.total)]);
      addTable('Material Items', ['MaterialId', 'Description', 'Qty', 'Unit Price', 'Total'], materialRows);

      // Services
      const serviceRows = (quotation.serviceItems || []).map(i => [i.service, toMoney(i.cost)]);
      addTable('Service Items', ['Service', 'Cost'], serviceRows);

      // Contingency
      const contRows = (quotation.contingencyItems || []).map(i => [i.description, toMoney(i.amount)]);
      addTable('Contingency / Misc', ['Description', 'Amount'], contRows);

      // Taxes
      const taxRows = (quotation.taxes || []).map(i => [i.description || '', `${i.percentage}%`, toMoney(i.amount)]);
      addTable('Taxes', ['Description', 'Percent', 'Amount'], taxRows);

      // Summary
      doc.moveDown(1);
      doc.fontSize(12).text('Summary', { underline: true }).moveDown(0.3);
      doc.fontSize(10);
      doc.text(`Subtotal: ${toMoney(quotation.subtotal || 0)}`);
      doc.text(`Contingency: ${toMoney(quotation.totalContingency || 0)}`);
      doc.text(`Tax: ${toMoney(quotation.totalTax || 0)}`);
      doc.text(`Grand Total: ${toMoney(quotation.grandTotal || 0)}`);

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });

  const url = `/uploads/quotations/${fileName}`;
  return { filePath, url };
}

function toMoney(n) {
  const num = Number(n) || 0;
  return `$${num.toFixed(2)}`;
}

export default { generateQuotationPdf };
