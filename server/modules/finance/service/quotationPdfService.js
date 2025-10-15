import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Generate a styled PDF file for a quotation and return a relative URL to the file
export async function generateQuotationPdf(quotation) {
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  const quotesDir = path.join(uploadsDir, 'quotations');
  if (!fs.existsSync(quotesDir)) {
    fs.mkdirSync(quotesDir, { recursive: true });
  }

  const safeProject = String(quotation.projectId);
  const fileName = `quotation_${safeProject}_${quotation.estimateVersion || 'v0'}_${quotation.version || 1}.pdf`;
  const filePath = path.join(quotesDir, fileName);

  await new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Palette
      const colors = {
        bgLight: '#FFF8E8',
        bgSection: '#F7EED3',
        accent: '#AAB396',
        primary: '#674636',
        white: '#FFFFFF',
      };
      const page = () => ({ w: doc.page.width, h: doc.page.height, ml: doc.page.margins.left, mt: doc.page.margins.top, mr: doc.page.margins.right, mb: doc.page.margins.bottom });

      // Header banner and meta
      const drawHeader = (showRemarks = true) => {
        const p = page();
        const barH = 40;
        doc.save();
        doc.rect(0, 0, p.w, barH).fill(colors.primary);
        doc.fillColor(colors.bgLight).font('Helvetica-Bold').fontSize(18).text('Quotation', p.ml, 12, { width: p.w - p.ml - p.mr, align: 'left' });
        doc.restore();

        const y = barH + 10;
        doc.save();
  doc.lineWidth(1).roundedRect(p.ml, y, p.w - p.ml - p.mr, 70, 6).fillAndStroke(colors.bgSection, colors.accent);
        doc.fillColor(colors.primary).font('Helvetica').fontSize(10);
        const metaLeft = p.ml + 12;
        const metaTop = y + 10;
        const lineGap = 14;
        doc.text(`Project: ${safeProject}`, metaLeft, metaTop);
        doc.text(`Estimate Version: ${quotation.estimateVersion}`, metaLeft, metaTop + lineGap);
        doc.text(`Quotation Version: ${quotation.version}`, metaLeft, metaTop + lineGap * 2);
        doc.text(`Date: ${new Date().toISOString().split('T')[0]}`, metaLeft, metaTop + lineGap * 3);
        doc.restore();

        // Compute flowing content start below meta/remarks boxes
        const metaBottom = y + 70;
        let contentTop = metaBottom + 12;
        if (showRemarks && quotation.remarks) {
          doc.save();
          const remarksY = y + 90;
          doc.roundedRect(p.ml, remarksY, p.w - p.ml - p.mr, 50, 6).fillAndStroke(colors.bgLight, colors.accent);
          doc.fillColor(colors.primary).fontSize(10).text(`Remarks: ${quotation.remarks}`, p.ml + 12, remarksY + 10, { width: p.w - p.ml - p.mr - 24 });
          doc.restore();
          contentTop = remarksY + 50 + 12;
        }
        // Advance document cursor to below header content
        doc.y = contentTop;
      };

      const ensureSpace = (needed = 0) => {
        const p = page();
        if (doc.y + needed > p.h - p.mb) {
          doc.addPage();
          // On subsequent pages, draw header without remarks block
          drawHeader(false);
        }
      };

      const drawSectionTitle = (title) => {
        ensureSpace(26);
        const p = page();
        const y = doc.y + 8;
        doc.save();
        doc.fillColor(colors.primary).font('Helvetica-Bold').fontSize(12).text(title, p.ml, y);
        doc.restore();
        doc.moveDown(1.2);
      };

      const drawTable = (columns, rows, widths) => {
        if (!rows || rows.length === 0) return;
        const p = page();
        const headH = 24;
        const startX = p.ml;
        let y = doc.y;

        const measureRowHeight = (r) => {
          let maxH = 0;
          r.forEach((cell, idx) => {
            const text = String(cell ?? '');
            const w = Math.max(10, widths[idx] - 12);
            const h = doc.heightOfString(text, { width: w });
            if (h > maxH) maxH = h;
          });
          return Math.max(24, 6 + maxH + 6);
        };

        const drawHeaderRow = () => {
          doc.save();
          doc.rect(startX, y, p.w - p.ml - p.mr, headH).fill(colors.bgSection);
          doc.strokeColor(colors.accent).lineWidth(1).rect(startX, y, p.w - p.ml - p.mr, headH).stroke();
          doc.fillColor(colors.primary).font('Helvetica-Bold').fontSize(10);
          let x = startX + 8;
          columns.forEach((col, idx) => {
            doc.text(col, x, y + 6, { width: widths[idx] - 12, continued: false });
            x += widths[idx];
          });
          doc.restore();
          y += headH;
        };

        const drawDataRow = (r, i) => {
          const rowH = measureRowHeight(r);
          doc.save();
          if (i % 2 === 1) {
            doc.rect(startX, y, p.w - p.ml - p.mr, rowH).fill(colors.bgLight);
          }
          doc.strokeColor(colors.accent).lineWidth(0.5).rect(startX, y, p.w - p.ml - p.mr, rowH).stroke();
          doc.fillColor(colors.primary).font('Helvetica').fontSize(10);
          let x = startX + 8;
          r.forEach((cell, idx) => {
            doc.text(String(cell ?? ''), x, y + 6, { width: widths[idx] - 12, continued: false });
            x += widths[idx];
          });
          doc.restore();
          y += rowH;
        };

        // Ensure space for header first
        ensureSpace(headH + 8);
        drawHeaderRow();
        rows.forEach((r, i) => {
          const rowH = measureRowHeight(r);
          if (y + rowH > page().h - page().mb) {
            doc.addPage();
            drawHeader(false);
            y = doc.y;
            drawHeaderRow();
          }
          drawDataRow(r, i);
        });
        doc.y = y + 6;
      };

      const drawSummary = (summary) => {
        const p = page();
        const boxW = (p.w - p.ml - p.mr - 24) / 4;
        const boxH = 54;
        const y = doc.y + 6;
        const labels = [
          ['Subtotal', toMoney(summary.subtotal)],
          ['Contingency', toMoney(summary.totalContingency)],
          ['Tax', toMoney(summary.totalTax)],
          ['Grand Total', toMoney(summary.grandTotal)],
        ];
        ensureSpace(boxH + 20);
        labels.forEach((pair, i) => {
          const x = p.ml + i * (boxW + 8);
          doc.save();
          const fill = i === 3 ? colors.primary : colors.bgSection;
          const text = i === 3 ? colors.bgLight : colors.primary;
          doc.roundedRect(x, y, boxW, boxH, 6).fillAndStroke(fill, colors.accent);
          doc.fillColor(text).font('Helvetica').fontSize(9).text(pair[0], x + 10, y + 10);
          doc.font('Helvetica-Bold').fontSize(12).text(pair[1], x + 10, y + 26);
          doc.restore();
        });
        doc.moveDown(4);
      };

      // Render content
  drawHeader(true);

      const laborRows = (quotation.laborItems || []).map(i => [i.task, String(i.hours ?? ''), toMoney(i.rate), toMoney(i.total)]);
      if (laborRows.length) {
        drawSectionTitle('Labor Items');
        drawTable(['Task', 'Hours', 'Rate', 'Total'], laborRows, [220, 70, 110, 112]);
      }

      const materialRows = (quotation.materialItems || []).map(i => [String(i.materialId || ''), i.description || '', String(i.quantity ?? ''), toMoney(i.unitPrice), toMoney(i.total)]);
      if (materialRows.length) {
        drawSectionTitle('Material Items');
        drawTable(['Material', 'Description', 'Qty', 'Unit Price', 'Total'], materialRows, [110, 202, 50, 75, 75]);
      }

      const serviceRows = (quotation.serviceItems || []).map(i => [i.service || '', toMoney(i.cost)]);
      if (serviceRows.length) {
        drawSectionTitle('Service Items');
        drawTable(['Service', 'Cost'], serviceRows, [380, 132]);
      }

      const contRows = (quotation.contingencyItems || []).map(i => [i.description || '', toMoney(i.amount)]);
      if (contRows.length) {
        drawSectionTitle('Contingency / Misc');
        drawTable(['Description', 'Amount'], contRows, [380, 132]);
      }

      const taxRows = (quotation.taxes || []).map(i => [i.description || '', `${i.percentage}%`, toMoney(i.amount)]);
      if (taxRows.length) {
        drawSectionTitle('Taxes');
        drawTable(['Description', 'Percent', 'Amount'], taxRows, [300, 100, 112]);
      }

      drawSectionTitle('Summary');
      drawSummary({
        subtotal: quotation.subtotal || 0,
        totalContingency: quotation.totalContingency || 0,
        totalTax: quotation.totalTax || 0,
        grandTotal: quotation.grandTotal || 0,
      });

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
  return `LKR ${num.toFixed(2)}`;
}

export default { generateQuotationPdf };
