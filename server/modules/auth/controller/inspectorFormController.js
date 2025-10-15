import InspectorForm from '../model/inspectorDynamicForm.model.js';
import InspectionRequest from '../model/inspectionRequest.model.js';
import AuthInspectionReport from '../model/report.model.js';
import PMNotification from '../model/notification.model.js';
import User from '../model/user.model.js';
import webSocketService from '../../../services/webSocketService.js';
import PDFKit from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Create new inspector form entry
export const createInspectorForm = async (req, res) => {
  try {
    const {
      InspectionRequest_ID,
      floors,
      recommendations
    } = req.body;

    const inspector_ID = req.user._id;

    // Validation - Allow standalone forms with null InspectionRequest_ID
    if (!floors || !Array.isArray(floors) || floors.length === 0) {
      return res.status(400).json({ message: 'Missing required fields. Floors data is required.' });
    }

    // Validate floors structure
    for (const floor of floors) {
      if (!floor.floor_number || !floor.rooms || !Array.isArray(floor.rooms) || floor.rooms.length === 0) {
        return res.status(400).json({ message: 'Each floor must have a floor number and at least one room.' });
      }
      
      for (const room of floor.rooms) {
        if (!room.room_name || !room.dimensions || 
            !room.dimensions.length || !room.dimensions.width || !room.dimensions.height) {
          return res.status(400).json({ message: 'Each room must have a name and complete dimensions.' });
        }
        
        // Validate room name (no numbers allowed)
        if (/\d/.test(room.room_name)) {
          return res.status(400).json({ message: 'Room names cannot contain numbers.' });
        }
        
        // Validate dimensions (only numbers allowed)
        if (isNaN(room.dimensions.length) || isNaN(room.dimensions.width) || isNaN(room.dimensions.height)) {
          return res.status(400).json({ message: 'Dimensions must be valid numbers.' });
        }
      }
    }

    // Only validate inspection request if InspectionRequest_ID is provided (assignment-based forms)
    let inspectionRequest = null;
    if (InspectionRequest_ID) {
      inspectionRequest = await InspectionRequest.findById(InspectionRequest_ID);
      if (!inspectionRequest) return res.status(404).json({ message: 'Inspection request not found' });
    }

    const inspectorForm = new InspectorForm({
      InspectionRequest_ID: InspectionRequest_ID || null, // Allow null for standalone forms
      inspector_ID,
      floors,
      recommendations,
      inspection_Date: new Date(),
      status: 'in-progress' // New forms should be in-progress by default
    });

    await inspectorForm.save();

    res.status(201).json({ 
      message: 'Inspection form created successfully', 
      form: inspectorForm 
    });
  } catch (error) {
    console.error('Error creating inspector form:', error);
    res.status(500).json({ message: 'Failed to create form', error: error.message });
  }
};

// Update inspector form entry
export const updateInspectorForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const inspector_ID = req.user._id;

    const form = await InspectorForm.findById(formId);
    if (!form) return res.status(404).json({ message: 'Form not found' });
    if (form.inspector_ID.toString() !== inspector_ID.toString()) return res.status(403).json({ message: 'Not authorized' });
    if (form.report_generated) return res.status(400).json({ message: 'Cannot update after report generated' });

    // Handle uploaded files
    const room_photo = req.files ? req.files.map(file => file.path) : form.room_photo;

    const updateData = { ...req.body, room_photo };

    const updatedForm = await InspectorForm.findByIdAndUpdate(formId, updateData, { new: true });
    res.status(200).json({ message: 'Form updated successfully', form: updatedForm });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update form', error: error.message });
  }
};

// Submit inspector form
export const submitInspectorForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const inspector_ID = req.user._id;

    const form = await InspectorForm.findById(formId);
    if (!form) return res.status(404).json({ message: 'Form not found' });
    if (form.inspector_ID.toString() !== inspector_ID.toString()) return res.status(403).json({ message: 'Not authorized' });
    if (form.report_generated) return res.status(400).json({ message: 'Cannot submit after report generated' });

    form.completion_status = 'submitted';
    form.status = 'completed';
    await form.save();

    res.status(200).json({ message: 'Form submitted successfully', form });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit form', error: error.message });
  }
};

// Generate report from form
export const generateReportFromForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await InspectorForm.findById(formId);
    if (!form) return res.status(404).json({ message: 'Form not found' });
    if (form.report_generated) return res.status(400).json({ message: 'Report already generated' });

    const report = new AuthInspectionReport({
      inspectorId: form.inspector_ID,  // Use correct field name from schema
      generatedBy: form.inspector_ID,  // Also required by schema
      title: `Inspection Report - ${new Date().toLocaleDateString()}`,
      reportData: {
        clientName: inspectionRequest?.client_name || 'N/A',
        propertyAddress: inspectionRequest?.propertyLocation_address || 'N/A',
        propertyType: inspectionRequest?.propertyType || 'N/A',
        inspectionDate: form.updatedAt || form.createdAt, // Use form saved date
        findings: 'Inspection completed',
        recommendations: form.recommendations || 'No recommendations provided',
        inspectorNotes: 'Generated from inspection form',
        inspectorName: req.user.username || 'Inspector'
      },
      status: 'completed',
      submittedAt: new Date() // When the report was submitted
    });
    await report.save();

    // Generate PDF file for the report
    try {
      const pdfPath = await generatePDFFile(report, form);
      report.pdfPath = pdfPath;
      await report.save();
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError);
      // Continue with the process even if PDF generation fails
    }

    form.report_generated = true;
    await form.save();

    // 🔥 NEW: Create notifications for project managers
    try {
      const projectManagers = await User.find({ role: 'project manager' });
      
      for (let pm of projectManagers) {
        await PMNotification.create({
          recipient_ID: pm._id,
          sender_ID: req.user._id,
          message: `New inspection report submitted by ${req.user.username}`,
          report_ID: report._id,
          status: 'unread'
        });
      }
      
      console.log(`Notifications created for ${projectManagers.length} project managers`);
      
      // 🔥 NEW: Send real-time WebSocket notification
      const realtimeData = {
        message: `New inspection report submitted by ${req.user.username}`,
        reportId: report._id,
        inspectorName: req.user.username,
        timestamp: new Date().toISOString()
      };
      webSocketService.notifyProjectManagers(realtimeData);
      
    } catch (notificationError) {
      console.error('Failed to create notifications:', notificationError);
      // Don't fail the entire operation if notification creation fails
    }

    // 🔥 REMOVED: Email notification service (replaced by real-time system)
    // Email notifications are no longer needed with real-time WebSocket notifications

    res.status(200).json({ message: 'Report generated successfully', report, form });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get inspector's own forms
export const getMyInspectorForms = async (req, res) => {
  try {
    const inspector_ID = req.user._id;
    const forms = await InspectorForm.find({ inspector_ID })
      .populate('InspectionRequest_ID', 'client_name propertyLocation_address')
      .sort({ createdAt: -1 });
    res.status(200).json({ message: 'Forms retrieved successfully', forms });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve forms', error: error.message });
  }
};

// Get all forms
export const getInspectorForms = async (req, res) => {
  try {
    const forms = await InspectorForm.find().populate('inspector_ID', 'username email').sort({ createdAt: -1 });
    res.status(200).json({ message: 'Forms retrieved successfully', forms });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get form by ID
export const getInspectorFormById = async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await InspectorForm.findById(formId).populate('inspector_ID', 'username email');
    if (!form) return res.status(404).json({ message: 'Form not found' });
    res.status(200).json({ message: 'Form retrieved successfully', form });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete form
export const deleteInspectorForm = async (req, res) => {
  try {
    const { formId } = req.params;
    
    // Use modern Mongoose delete method
    const deletedForm = await InspectorForm.findByIdAndDelete(formId);
    
    if (!deletedForm) {
      return res.status(404).json({ message: 'Form not found' });
    }
    
    console.log(`Form ${formId} deleted successfully`);
    res.status(200).json({ 
      message: 'Form deleted successfully',
      deletedFormId: formId 
    });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ 
      message: 'Failed to delete form',
      error: error.message 
    });
  }
};

// 🔥 NEW: Submit form and generate report in one action
export const submitAndGenerateReport = async (req, res) => {
  try {
    const { formId } = req.params;
    const inspector_ID = req.user._id;

    // 1. Find and validate form
    const form = await InspectorForm.findById(formId).populate('InspectionRequest_ID');
    if (!form) return res.status(404).json({ message: 'Form not found' });
    if (form.inspector_ID.toString() !== inspector_ID.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (form.report_generated) {
      return res.status(400).json({ message: 'Report already generated' });
    }

    // 2. Submit form
    form.status = 'completed';
    await form.save();

    // 3. Generate detailed report content from form data
    const reportContent = `
Inspection Report Summary:
- Property: ${form.InspectionRequest_ID?.propertyLocation_address || 'N/A'}
- Inspector: ${req.user.username}
- Total Floors: ${form.floors?.length || 0}
- Total Rooms: ${form.floors?.reduce((total, floor) => total + (floor.rooms?.length || 0), 0) || 0}

Floor Details:
${form.floors?.map(floor => `
Floor ${floor.floor_number}:
${floor.rooms?.map(room => `  - ${room.room_name}: ${room.dimensions?.length || 0} x ${room.dimensions?.width || 0} x ${room.dimensions?.height || 0} ${room.dimensions?.unit || 'feet'}`).join('\n') || '  No rooms data'}
`).join('\n') || 'No floor data available'}
    `.trim();

    // 4. Create report
    const report = new AuthInspectionReport({
      inspectorId: form.inspector_ID,  // Use correct field name from schema
      generatedBy: form.inspector_ID,  // Also required by schema
      title: `Inspection Report - ${form.InspectionRequest_ID?.client_name || 'Client'} - ${new Date().toLocaleDateString()}`,
      reportData: {
        clientName: form.InspectionRequest_ID?.client_name || 'N/A',
        propertyAddress: form.InspectionRequest_ID?.propertyLocation_address || 'N/A',
        propertyType: form.InspectionRequest_ID?.propertyType || 'N/A',
        inspectionDate: form.updatedAt || form.createdAt, // Use form saved date
        findings: `Inspection completed with ${form.floors?.length || 0} floors and ${form.floors?.reduce((total, floor) => total + (floor.rooms?.length || 0), 0) || 0} rooms`,
        recommendations: form.recommendations || 'No recommendations provided',
        inspectorNotes: reportContent,
        inspectorName: req.user.username || 'Inspector'
      },
      status: 'completed',
      submittedAt: new Date() // When the report was submitted
    });
    await report.save();

    // 4.5. Generate PDF file for the report
    try {
      const pdfPath = await generatePDFFile(report, form);
      report.pdfPath = pdfPath;
      await report.save();
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError);
      // Continue with the process even if PDF generation fails
    }

    // 5. Mark form as report generated
    form.report_generated = true;
    await form.save();

    // 6. Create notifications for project managers
    try {
      const projectManagers = await User.find({ role: 'project manager' });
      
      for (let pm of projectManagers) {
        await PMNotification.create({
          recipient_ID: pm._id,
          sender_ID: req.user._id,
          message: `New inspection report submitted by ${req.user.username} for ${form.InspectionRequest_ID?.client_name || 'Client'}`,
          report_ID: report._id,
          status: 'unread'
        });
      }
      
      console.log(`Notifications created for ${projectManagers.length} project managers`);
      
      // 🔥 NEW: Send real-time WebSocket notification
      const realtimeData = {
        message: `New inspection report submitted by ${req.user.username} for ${form.InspectionRequest_ID?.client_name || 'Client'}`,
        reportId: report._id,
        inspectorName: req.user.username,
        clientName: form.InspectionRequest_ID?.client_name || 'Client',
        propertyAddress: form.InspectionRequest_ID?.propertyLocation_address || 'N/A',
        timestamp: new Date().toISOString()
      };
      webSocketService.notifyProjectManagers(realtimeData);
      
    } catch (notificationError) {
      console.error('Failed to create notifications:', notificationError);
    }

    // 🔥 REMOVED: Email notification service (replaced by real-time system)
    // Email notifications are no longer needed with real-time WebSocket notifications

    res.status(200).json({ 
      message: 'Form submitted and report generated successfully', 
      form, 
      report 
    });
  } catch (error) {
    console.error('Error in submitAndGenerateReport:', error);
    res.status(500).json({ message: 'Failed to submit form and generate report', error: error.message });
  }
};

// Helper function to generate PDF file
const generatePDFFile = async (report, form) => {
  return new Promise((resolve, reject) => {
    try {
      // Create reports directory if it doesn't exist
      const reportsDir = path.join(process.cwd(), 'public', 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Generate unique filename
      const filename = `report_${report._id}_${Date.now()}.pdf`;
      const filePath = path.join(reportsDir, filename);
      const relativePath = `/reports/${filename}`;

      // Create PDF document - SIMPLE AND WORKING
      const doc = new PDFKit({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Professional colors
      const primaryColor = '#8B4513';
      const lightGray = '#F5F5DC';
      
      // Professional Header
      doc.rect(0, 0, doc.page.width, 100).fill(primaryColor);
      
      doc.fillColor('white')
         .fontSize(32)
         .font('Helvetica-Bold')
         .text('DESYNFLOW', 60, 25);
      
      doc.fontSize(14)
         .font('Helvetica')
         .text('Professional Property Inspection Services', 60, 65);

      // Company Details (Right side)
      const rightStart = doc.page.width - 220;
      doc.fillColor('white')
         .fontSize(10)
         .font('Helvetica')
         .text('123 Business Avenue, Colombo 03', rightStart, 25)
         .text('Tel: +94 11 234 5678', rightStart, 40)
         .text('Email: info@desynflow.lk', rightStart, 55);

      // Report Title
      doc.fillColor(primaryColor)
         .fontSize(26)
         .font('Helvetica-Bold')
         .text('INSPECTION REPORT', 60, 130);

      doc.moveTo(60, 165)
         .lineTo(doc.page.width - 60, 165)
         .strokeColor(primaryColor)
         .lineWidth(2)
         .stroke();

      let y = 190;

      // Report Information
      doc.fillColor(primaryColor)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('REPORT INFORMATION', 60, y);
      
      doc.moveTo(60, y + 18)
         .lineTo(300, y + 18)
         .strokeColor(primaryColor)
         .lineWidth(1)
         .stroke();
      
      y += 35;

      doc.fillColor('#333333')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('Report ID:', 60, y);
      doc.font('Helvetica')
         .text(report._id.toString().slice(-8).toUpperCase(), 200, y);
      y += 18;

      doc.font('Helvetica-Bold')
         .text('Status:', 60, y);
      doc.font('Helvetica')
         .text((report.status || 'completed').toUpperCase(), 200, y);
      y += 18;

      doc.font('Helvetica-Bold')
         .text('Generated Date:', 60, y);
      doc.font('Helvetica')
         .text(new Date().toLocaleDateString('en-US', { 
           year: 'numeric', 
           month: 'long', 
           day: 'numeric' 
         }), 200, y);
      y += 30;

      // Client & Property Information
      if (report.reportData) {
        doc.fillColor(primaryColor)
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('CLIENT & PROPERTY INFORMATION', 60, y);
        
        doc.moveTo(60, y + 18)
           .lineTo(350, y + 18)
           .strokeColor(primaryColor)
           .lineWidth(1)
           .stroke();
        
        y += 35;

        doc.fillColor('#333333')
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('Client Name:', 60, y);
        doc.font('Helvetica')
           .text(report.reportData.clientName || 'Not specified', 200, y);
        y += 18;

        doc.font('Helvetica-Bold')
           .text('Property Address:', 60, y);
        doc.font('Helvetica')
           .text(report.reportData.propertyAddress || 'Not specified', 200, y, { width: 300 });
        y += 18;

        doc.font('Helvetica-Bold')
           .text('Property Type:', 60, y);
        doc.font('Helvetica')
           .text((report.reportData.propertyType || 'Not specified').toUpperCase(), 200, y);
        y += 30;

        // Room Details
        if (form && form.floors && form.floors.length > 0) {
          doc.fillColor(primaryColor)
             .fontSize(14)
             .font('Helvetica-Bold')
             .text('PROPERTY LAYOUT & ROOM DETAILS', 60, y);
          
          doc.moveTo(60, y + 18)
             .lineTo(350, y + 18)
             .strokeColor(primaryColor)
             .lineWidth(1)
             .stroke();
          
          y += 35;

          form.floors.forEach((floor, floorIndex) => {
            doc.fillColor('#A0522D')
               .fontSize(13)
               .font('Helvetica-Bold')
               .text(`Floor ${floor.floor_number || (floorIndex + 1)}:`, 60, y);
            y += 20;

            if (floor.rooms && floor.rooms.length > 0) {
              floor.rooms.forEach((room, roomIndex) => {
                const roomName = room.room_name || `Room ${roomIndex + 1}`;
                const dimensions = room.dimensions || {};
                const length = dimensions.length || 'N/A';
                const width = dimensions.width || 'N/A';
                const height = dimensions.height || 'N/A';
                const unit = dimensions.unit || 'feet';
                
                doc.rect(80, y, doc.page.width - 160, 25)
                   .fillAndStroke('#FFFFFF', primaryColor)
                   .lineWidth(1);
                
                doc.fillColor('#333333')
                   .fontSize(10)
                   .font('Helvetica-Bold')
                   .text(`${roomName}:`, 90, y + 6);
                
                doc.font('Helvetica')
                   .text(`${length} × ${width} × ${height} ${unit}`, 200, y + 6);
                
                y += 30;
              });
            }
            y += 10;
          });
          y += 20;
        }

        // Summary
        doc.fillColor(primaryColor)
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('INSPECTION SUMMARY', 60, y);
        
        doc.moveTo(60, y + 18)
           .lineTo(300, y + 18)
           .strokeColor(primaryColor)
           .lineWidth(1)
           .stroke();
        
        y += 35;

        const findingsText = report.reportData.findings || 'Inspection completed with detailed room measurements';
        
        doc.rect(60, y, doc.page.width - 120, 45)
           .fillAndStroke(lightGray, primaryColor)
           .lineWidth(1);
        
        doc.fillColor('#333333')
           .fontSize(10)
           .font('Helvetica')
           .text(findingsText, 70, y + 10, {
             width: doc.page.width - 140,
             align: 'left'
           });
        
        y += 60;

        // Recommendations - DYNAMIC BOX SIZE
        doc.fillColor(primaryColor)
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('RECOMMENDATIONS', 60, y);
        
        doc.moveTo(60, y + 18)
           .lineTo(300, y + 18)
           .strokeColor(primaryColor)
           .lineWidth(1)
           .stroke();
        
        y += 35;

        const recommendationsText = report.reportData.recommendations || 'No specific recommendations - property ready for project planning';
        
        // Calculate dynamic height for recommendations
        const recTextWidth = doc.page.width - 140;
        doc.fontSize(10).font('Helvetica');
        const recTextHeight = doc.heightOfString(recommendationsText, {
          width: recTextWidth,
          fontSize: 10
        });
        const recDynamicHeight = Math.max(recTextHeight + 20, 45);
        
        // Check if recommendations box fits on current page
        if (y + recDynamicHeight > doc.page.height - 150) {
          doc.addPage();
          y = 50;
          
          // Re-add the section header on new page
          doc.fillColor(primaryColor)
             .fontSize(14)
             .font('Helvetica-Bold')
             .text('RECOMMENDATIONS', 60, y);
          
          doc.moveTo(60, y + 18)
             .lineTo(300, y + 18)
             .strokeColor(primaryColor)
             .lineWidth(1)
             .stroke();
          
          y += 35;
        }
        
        doc.rect(60, y, doc.page.width - 120, recDynamicHeight)
           .fillAndStroke(lightGray, primaryColor)
           .lineWidth(1);
        
        doc.fillColor('#333333')
           .fontSize(10)
           .font('Helvetica')
           .text(recommendationsText, 70, y + 10, {
             width: recTextWidth,
             align: 'left',
             lineGap: 2
           });
        
        y += recDynamicHeight + 20;

        // Detailed Notes (if available) - PROPERLY DYNAMIC BOX
        if (report.reportData.inspectorNotes) {
          // Check if we need a new page for the notes section
          if (y > doc.page.height - 200) {
            doc.addPage();
            y = 50; // Reset y position for new page
          }

          doc.fillColor(primaryColor)
             .fontSize(14)
             .font('Helvetica-Bold')
             .text('DETAILED INSPECTION NOTES', 60, y);
          
          doc.moveTo(60, y + 18)
             .lineTo(350, y + 18)
             .strokeColor(primaryColor)
             .lineWidth(1)
             .stroke();
          
          y += 35;

          // Calculate dynamic height based on text content with proper wrapping
          const notesText = report.reportData.inspectorNotes;
          const textWidth = doc.page.width - 140; // Box inner width
          const fontSize = 10;
          
          // Set the font for accurate measurement
          doc.fontSize(fontSize).font('Helvetica');
          
          // Calculate the actual height needed for the text with wrapping
          const textHeight = doc.heightOfString(notesText, {
            width: textWidth,
            fontSize: fontSize
          });
          
          // Add padding and ensure minimum height
          const dynamicHeight = Math.max(textHeight + 30, 60);

          // Check if the box will fit on current page
          if (y + dynamicHeight > doc.page.height - 100) {
            doc.addPage();
            y = 50;
            
            // Re-add the section header on new page
            doc.fillColor(primaryColor)
               .fontSize(14)
               .font('Helvetica-Bold')
               .text('DETAILED INSPECTION NOTES', 60, y);
            
            doc.moveTo(60, y + 18)
               .lineTo(350, y + 18)
               .strokeColor(primaryColor)
               .lineWidth(1)
               .stroke();
            
            y += 35;
          }

          // Draw the dynamic box
          doc.rect(60, y, doc.page.width - 120, dynamicHeight)
             .fillAndStroke('#FFFFFF', primaryColor)
             .lineWidth(1);
          
          // Add the text inside the box with proper formatting
          doc.fillColor('#333333')
             .fontSize(fontSize)
             .font('Helvetica')
             .text(notesText, 70, y + 15, {
               width: textWidth,
               align: 'left',
               lineGap: 2
             });
          
          y += dynamicHeight + 20;
        }
      }

      // Professional Footer - Always at bottom of document
      const footerY = doc.page.height - 80;
      doc.rect(0, footerY, doc.page.width, 80).fill(primaryColor);
      
      doc.fillColor('white')
         .fontSize(10)
         .font('Helvetica')
         .text('This report is confidential and prepared exclusively for the named client.', 60, footerY + 15);
      
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, 60, footerY + 30);
      
      doc.text('DesynFlow Property Services | Professional Inspection Solutions', 60, footerY + 45);

      doc.end();

      stream.on('finish', () => {
        resolve(relativePath);
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};
