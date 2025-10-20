import jsPDF from 'jspdf';

/**
 * PDF Generator Utility for DesynFlow System
 * Handles all PDF generation functionality for orders and receipts
 */

export class PDFGenerator {
  constructor() {
    this.brandColor = { r: 103, g: 70, b: 54 }; // #674636
    this.lightGray = { r: 248, g: 249, b: 250 };
    this.darkGray = { r: 128, g: 128, b: 128 };
  }

  /**
   * Generate Order Receipt PDF
   * @param {Object} order - Order object containing all order details
   * @returns {void} - Downloads the PDF file
   */
  generateOrderReceiptPDF(order) {
    const doc = new jsPDF();
    
    this._addHeader(doc);
    this._addOrderInfo(doc, order);
    this._addSupplierInfo(doc, order);
    this._addOrderItemsTable(doc, order);
    this._addTotalAmount(doc, order);
    this._addFooter(doc);
    
    // Save the PDF with descriptive filename
    const filename = `Order_Receipt_${order._id?.slice(-8) || 'Unknown'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  }

  /**
   * Generate Supplier Profile PDF
   * @param {Object} supplier - Supplier object containing supplier details
   * @returns {void} - Downloads the PDF file
   */
  generateSupplierProfilePDF(supplier) {
    const doc = new jsPDF();
    
    this._addHeader(doc, 'Supplier Profile Report');
    this._addSupplierProfileInfo(doc, supplier);
    this._addSupplierMaterials(doc, supplier);
    this._addFooter(doc);
    
    // Save the PDF
    const filename = `Supplier_Profile_${supplier.companyName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Unknown'}.pdf`;
    doc.save(filename);
  }

  /**
   * Private method to add PDF header
   */
  _addHeader(doc, title = 'Order Receipt Report') {
    // Professional Header Background
    doc.setFillColor(139, 69, 19); // #8B4513 - Primary brown color
    doc.rect(0, 0, doc.internal.pageSize.width, 50, 'F');
    
    // Main Company Branding
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('DESYNFLOW', 20, 20);
    
    // Subtitle
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Professional Interior Design Services', 20, 32);
    
    // Company Contact Information (Right aligned)
    doc.setFontSize(8);
    doc.text('123 Business Avenue, Colombo 03', doc.internal.pageSize.width - 20, 15, { align: 'right' });
    doc.text('Tel: +94 11 234 5678', doc.internal.pageSize.width - 20, 22, { align: 'right' });
    doc.text('Email: info@desynflow.lk', doc.internal.pageSize.width - 20, 29, { align: 'right' });
    doc.text('Web: www.desynflow.lk', doc.internal.pageSize.width - 20, 36, { align: 'right' });
    
    // Document Title
    doc.setFontSize(18);
    doc.setTextColor(139, 69, 19); // Brown color for title
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, 65);
    
    // Decorative line under title
    doc.setDrawColor(139, 69, 19);
    doc.setLineWidth(1);
    doc.line(20, 70, doc.internal.pageSize.width - 20, 70);
  }

  /**
   * Private method to add order information section
   */
  _addOrderInfo(doc, order) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    const orderInfo = [
      `Order ID: #${order._id?.slice(-8) || 'N/A'}`,
      `Generated: ${new Date().toLocaleDateString()}`,
      `Status: ${order.status || 'Unknown'}`,
      `Order Date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}`
    ];

    orderInfo.forEach((info, index) => {
      doc.text(info, 20, 85 + (index * 10));
    });
  }

  /**
   * Private method to add supplier information section
   */
  _addSupplierInfo(doc, order) {
    doc.setFontSize(14);
    doc.setTextColor(this.brandColor.r, this.brandColor.g, this.brandColor.b);
    doc.text('Supplier Information', 20, 135);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    const supplierInfo = [
      `Company: ${order.supplierId?.companyName || order.supplierId || 'Unknown'}`,
      order.supplierId?.email ? `Email: ${order.supplierId.email}` : null,
      order.supplierId?.phone ? `Phone: ${order.supplierId.phone}` : null,
      order.supplierId?.contactName ? `Contact: ${order.supplierId.contactName}` : null
    ].filter(Boolean);

    supplierInfo.forEach((info, index) => {
      doc.text(info, 25, 150 + (index * 12));
    });
  }

  /**
   * Private method to add supplier profile information
   */
  _addSupplierProfileInfo(doc, supplier) {
    doc.setFontSize(14);
    doc.setTextColor(this.brandColor.r, this.brandColor.g, this.brandColor.b);
    doc.text('Company Details', 20, 90);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    const profileInfo = [
      `Company Name: ${supplier.companyName || 'N/A'}`,
      `Contact Person: ${supplier.contactName || 'N/A'}`,
      `Email: ${supplier.email || 'N/A'}`,
      `Phone: ${supplier.phone || 'N/A'}`,
      `Rating: ${typeof supplier.rating === 'number' ? supplier.rating.toFixed(2) : supplier.rating || 'Not rated'}`,
      `Delivery Regions: ${supplier.deliveryRegions?.join(', ') || 'Not specified'}`
    ];

    profileInfo.forEach((info, index) => {
      doc.text(info, 25, 105 + (index * 12));
    });
  }

  /**
   * Private method to add supplier materials catalog
   */
  _addSupplierMaterials(doc, supplier) {
    const startY = 190;
    
    doc.setFontSize(14);
    doc.setTextColor(this.brandColor.r, this.brandColor.g, this.brandColor.b);
    doc.text('Materials Catalog', 20, startY);
    
    if (!supplier.materials || supplier.materials.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(this.darkGray.r, this.darkGray.g, this.darkGray.b);
      doc.text('No materials catalog available', 25, startY + 15);
      return;
    }

    // Materials table header
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(this.brandColor.r, this.brandColor.g, this.brandColor.b);
    doc.rect(20, startY + 10, 170, 10, 'F');
    doc.text('Material Name', 25, startY + 17);
    doc.text('Price per Unit (LKR)', 140, startY + 17);

    // Materials rows
    let currentY = startY + 25;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);

    supplier.materials.forEach((material, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(this.lightGray.r, this.lightGray.g, this.lightGray.b);
        doc.rect(20, currentY - 5, 170, 10, 'F');
      }

      doc.text(material.name || 'Unknown', 25, currentY);
      const price = material.pricePerUnit || 0;
      doc.text(`LKR ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price)}`, 145, currentY);
      currentY += 12;
    });
  }

  /**
   * Private method to add order items table
   */
  _addOrderItemsTable(doc, order) {
    const startY = 200;
    
    doc.setFontSize(14);
    doc.setTextColor(this.brandColor.r, this.brandColor.g, this.brandColor.b);
    doc.text('Order Items', 20, startY);
    
    // Table header
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(this.brandColor.r, this.brandColor.g, this.brandColor.b);
    doc.rect(20, startY + 10, 170, 10, 'F');
    doc.text('#', 25, startY + 17);
    doc.text('Material', 35, startY + 17);
    doc.text('Qty', 120, startY + 17);
    doc.text('Unit Price (LKR)', 140, startY + 17);
    doc.text('Total (LKR)', 165, startY + 17);
    
    // Table rows
    let currentY = startY + 25;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    
    if (!order.items || order.items.length === 0) {
      doc.setTextColor(this.darkGray.r, this.darkGray.g, this.darkGray.b);
      doc.text('No items in this order', 25, currentY);
      return currentY + 20;
    }
    
    order.items.forEach((item, index) => {
      const materialName = item.materialId?.materialName || item.materialName || 'Unknown Material';
      const quantity = item.qty || item.quantity || 0;
      const unitPrice = item.unitPrice || item.pricePerUnit || 0;
      const total = (unitPrice * quantity);
      
      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(this.lightGray.r, this.lightGray.g, this.lightGray.b);
        doc.rect(20, currentY - 5, 170, 10, 'F');
      }
      
      doc.text(`${index + 1}`, 25, currentY);
      doc.text(materialName.length > 30 ? materialName.substring(0, 30) + '...' : materialName, 35, currentY);
      doc.text(`${quantity}`, 125, currentY);
      doc.text(`LKR ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(unitPrice)}`, 145, currentY);
      doc.text(`LKR ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total)}`, 170, currentY);
      
      currentY += 12;
    });
    
    return currentY;
  }

  /**
   * Private method to add total amount section
   */
  _addTotalAmount(doc, order) {
    const totalAmount = order.items?.reduce((total, item) => 
      total + ((item.unitPrice || item.pricePerUnit) * (item.qty || item.quantity) || 0), 0
    ) || 0;
    
    const currentY = 250 + (order.items?.length || 0) * 12;
    
    // Total amount box
    doc.setFillColor(this.lightGray.r, this.lightGray.g, this.lightGray.b);
    doc.rect(120, currentY, 70, 15, 'F');
    doc.setDrawColor(this.brandColor.r, this.brandColor.g, this.brandColor.b);
    doc.rect(120, currentY, 70, 15);
    
    doc.setFontSize(12);
    doc.setTextColor(this.brandColor.r, this.brandColor.g, this.brandColor.b);
    doc.text(`Total: LKR ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalAmount)}`, 155, currentY + 10, { align: 'center' });
  }

  /**
   * Private method to add footer
   */
  _addFooter(doc) {
    const pageHeight = doc.internal.pageSize.height;
    
    // Footer background
    doc.setFillColor(139, 69, 19); // #8B4513 - Primary brown color
    doc.rect(0, pageHeight - 40, doc.internal.pageSize.width, 40, 'F');
    
    // Footer line
    doc.setDrawColor(255, 255, 255);
    doc.line(20, pageHeight - 35, doc.internal.pageSize.width - 20, pageHeight - 35);
    
    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('This document was automatically generated by DESYNFLOW System', 20, pageHeight - 25);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, doc.internal.pageSize.width - 20, pageHeight - 25, { align: 'right' });
    
    // Additional footer info
    doc.setFontSize(7);
    doc.text('Professional Interior Design & Property Services | Tel: +94 11 234 5678 | Email: info@desynflow.lk', 20, pageHeight - 15);
  }
}

// Export a singleton instance
export const pdfGenerator = new PDFGenerator();

// Export individual functions for convenience
export const generateOrderReceiptPDF = (order) => pdfGenerator.generateOrderReceiptPDF(order);
export const generateSupplierProfilePDF = (supplier) => pdfGenerator.generateSupplierProfilePDF(supplier);