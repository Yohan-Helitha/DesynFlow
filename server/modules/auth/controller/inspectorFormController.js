import InspectorForm from '../model/inspectorDynamicForm.model.js';
import InspectionRequest from '../model/inspectionRequest.model.js';
import Assignment from '../model/assignment.model.js';
import InspectorLocation from '../model/inspectorLocation.model.js';
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
      title: `Inspection Report - ${new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Colombo' })} at ${new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Colombo' })}`,
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

    // 🔥 CRITICAL FIX: Update assignment status and inspector availability when report is generated
    try {
      const assignment = await Assignment.findOne({ 
        InspectionRequest_ID: form.InspectionRequest_ID,
        inspector_ID: req.user._id
      });
      
      if (assignment && assignment.status !== 'completed') {
        assignment.status = 'completed';
        assignment.inspection_end_time = new Date();
        assignment.updatedAt = new Date();
        await assignment.save();
        console.log(`Assignment ${assignment._id} status updated to completed via report generation`);
        
        // Update inspector location status back to 'available'
        const inspectorLocation = await InspectorLocation.findOne({ inspector_ID: req.user._id });
        if (inspectorLocation) {
          inspectorLocation.status = 'available';
          await inspectorLocation.save();
          console.log(`Inspector ${req.user._id} status updated to available via report generation`);
        }
        
        // Send real-time notification to CSR about assignment completion
        const csrUsers = await User.find({ role: 'customer service representative' });
        for (let csr of csrUsers) {
          webSocketService.sendToUser(csr._id.toString(), 'assignment_completed', {
            assignmentId: assignment._id,
            inspectorName: req.user.username,
            propertyAddress: inspectionRequest?.propertyLocation_address || 'N/A',
            clientName: inspectionRequest?.client_name || 'Client',
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (assignmentError) {
      console.error('Error updating assignment status during report generation:', assignmentError);
      // Continue with the process even if assignment update fails
    }

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

    // 2.5. Update related assignment status to completed
    try {
      const assignment = await Assignment.findOne({ 
        InspectionRequest_ID: form.InspectionRequest_ID,
        inspector_ID: inspector_ID
      });
      
      if (assignment) {
        assignment.status = 'completed';
        assignment.inspection_end_time = new Date();
        assignment.updatedAt = new Date();
        await assignment.save();
        console.log(`Assignment ${assignment._id} status updated to completed`);
        
        // 🔥 CRITICAL FIX: Update inspector location status back to 'available'
        const inspectorLocation = await InspectorLocation.findOne({ inspector_ID: inspector_ID });
        if (inspectorLocation) {
          inspectorLocation.status = 'available';
          // Reset location back to inspector's base location (remove property assignment location)
          // Keep the current coordinates but update status to available
          await inspectorLocation.save();
          console.log(`Inspector ${inspector_ID} status updated to available`);
        }
        
        // 🔥 Send real-time notification to CSR about assignment completion
        const csrUsers = await User.find({ role: 'customer service representative' });
        for (let csr of csrUsers) {
          webSocketService.sendToUser(csr._id.toString(), 'assignment_completed', {
            assignmentId: assignment._id,
            inspectorName: req.user.username,
            propertyAddress: form.InspectionRequest_ID?.propertyLocation_address || 'N/A',
            clientName: form.InspectionRequest_ID?.client_name || 'Client',
            timestamp: new Date().toISOString()
          });
        }
      } else {
        console.log('No matching assignment found for this inspection request and inspector');
      }
    } catch (assignmentError) {
      console.error('Error updating assignment status:', assignmentError);
      // Continue with the process even if assignment update fails
    }

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

Recommendations: ${form.recommendations || 'No recommendations provided'}
    `.trim();

    // 4. Create report
    const report = new AuthInspectionReport({
      inspectorId: form.inspector_ID,  // Use correct field name from schema
      generatedBy: form.inspector_ID,  // Also required by schema
      title: `Inspection Report - ${form.InspectionRequest_ID?.client_name || 'Client'} - ${new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Colombo' })} at ${new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Colombo' })}`,
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

      // Create PDF document - COMPACT APPROACH
      const doc = new PDFKit({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50, // Smaller margin to allow more content per page
          left: 50,
          right: 50
        },
        autoFirstPage: true
      });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Colors
      const primaryColor = '#8B4513';
      const secondaryColor = '#A0522D';
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

      let currentY = 190;

      // Report Information Section
      currentY = addSection(doc, 'REPORT INFORMATION', currentY, primaryColor);
      currentY = addInfoRow(doc, 'Report ID:', report._id.toString().slice(-8).toUpperCase(), currentY);
      currentY = addInfoRow(doc, 'Report Title:', report.title || 'Inspection Report', currentY);
      currentY = addInfoRow(doc, 'Status:', (report.status || 'completed').toUpperCase(), currentY);
      currentY = addInfoRow(doc, 'Generated Date & Time:', report.submittedAt ? new Date(report.submittedAt).toLocaleString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Colombo'
      }) : 'Date not recorded', currentY);
      currentY += 15; // Reduced spacing

      // Client & Property Section
      if (report.reportData) {
        currentY = addSection(doc, 'CLIENT & PROPERTY INFORMATION', currentY, primaryColor);
        currentY = addInfoRow(doc, 'Client Name:', report.reportData.clientName || 'Not specified', currentY);
        currentY = addInfoRow(doc, 'Property Address:', report.reportData.propertyAddress || 'Not specified', currentY);
        currentY = addInfoRow(doc, 'Property Type:', (report.reportData.propertyType || 'Not specified').toUpperCase(), currentY);
        currentY = addInfoRow(doc, 'Inspection Date:', report.reportData.inspectionDate ? 
          new Date(report.reportData.inspectionDate).toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }) : 'Date not recorded', currentY);
        currentY += 15; // Reduced spacing

        // Inspector Information
        currentY = addSection(doc, 'INSPECTOR INFORMATION', currentY, primaryColor);
        currentY = addInfoRow(doc, 'Inspector Name:', report.reportData.inspectorName || 'Not specified', currentY);
        currentY = addInfoRow(doc, 'Inspection Company:', 'DesynFlow Property Services', currentY);
        currentY += 15; // Reduced spacing

        // Room Details - Only add if rooms exist
        if (form && form.floors && form.floors.length > 0) {
          let hasRooms = false;
          // Check if any floor has rooms
          for (const floor of form.floors) {
            if (floor.rooms && floor.rooms.length > 0) {
              hasRooms = true;
              break;
            }
          }
          
          if (hasRooms) {
            currentY = addSection(doc, 'PROPERTY LAYOUT & ROOM DETAILS', currentY, primaryColor);
            
            form.floors.forEach((floor, floorIndex) => {
              if (floor.rooms && floor.rooms.length > 0) {
                doc.fillColor(secondaryColor)
                   .fontSize(13)
                   .font('Helvetica-Bold')
                   .text(`Floor ${floor.floor_number || (floorIndex + 1)}:`, 60, currentY);
                currentY += 25;

                floor.rooms.forEach((room, roomIndex) => {
                  const roomName = room.room_name || `Room ${roomIndex + 1}`;
                  const dimensions = room.dimensions || {};
                  const length = dimensions.length || 'N/A';
                  const width = dimensions.width || 'N/A';
                  const height = dimensions.height || 'N/A';
                  const unit = dimensions.unit || 'feet';
                  
                  // Check if we need a new page
                  if (currentY > doc.page.height - 100) {
                    doc.addPage();
                    currentY = 60;
                  }
                  
                  doc.rect(80, currentY, doc.page.width - 160, 30)
                     .fillAndStroke('#FFFFFF', primaryColor)
                     .lineWidth(1);
                  
                  doc.fillColor('#333333')
                     .fontSize(11)
                     .font('Helvetica-Bold')
                     .text(`${roomName}:`, 90, currentY + 8);
                  
                  doc.font('Helvetica')
                     .text(`${length} × ${width} × ${height} ${unit}`, 200, currentY + 8);
                  
                  currentY += 35;
                });
                currentY += 15;
              }
            });
          }
        }

        // Dynamic text sections
        const textOptions = { width: doc.page.width - 140, align: 'left' };

        // Findings
        currentY = addSection(doc, 'INSPECTION SUMMARY', currentY, primaryColor);
        const findingsText = report.reportData.findings || 'Inspection completed with detailed room measurements and property assessment.';
        currentY = addTextBox(doc, findingsText, currentY, lightGray, primaryColor, textOptions, 11);

        // Recommendations  
        currentY = addSection(doc, 'RECOMMENDATIONS', currentY, primaryColor);
        const recommendationsText = report.reportData.recommendations || 'Property is suitable for interior design project planning. Room dimensions have been recorded for design purposes.';
        currentY = addTextBox(doc, recommendationsText, currentY, lightGray, primaryColor, textOptions, 11);

        // Detailed Notes - Only add if content exists
        if (report.reportData.inspectorNotes && report.reportData.inspectorNotes.trim().length > 0) {
          currentY = addSection(doc, 'DETAILED INSPECTION NOTES', currentY, primaryColor);
          currentY = addTextBox(doc, report.reportData.inspectorNotes, currentY, '#FFFFFF', primaryColor, textOptions, 10);
        }
      }

      // Add footer on the final page only
      const footerY = doc.page.height - 70;
      
      // Ensure footer doesn't overlap with content
      if (currentY > footerY - 20) {
        doc.addPage();
      }
      
      // Add footer background
      doc.rect(0, footerY, doc.page.width, 70).fill(primaryColor);
      
      // Add footer text
      doc.fillColor('white')
         .fontSize(9)
         .font('Helvetica')
         .text('This report is confidential and prepared exclusively for the named client.', 60, footerY + 10);
      
      doc.text(`Generated on: ${new Date().toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Colombo'
      })}`, 60, footerY + 25);
      
      doc.text('DesynFlow Property Services | Professional Inspection Solutions', 60, footerY + 40);

      // Finalize PDF
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

  // Helper function to add section headers with page break handling
  function addSection(doc, title, yPos, color) {
    // Check if we need a new page for the section
    if (yPos > doc.page.height - 150) {
      doc.addPage();
      yPos = 60; // Reset Y position for new page
    }
    
    doc.fillColor(color)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text(title, 60, yPos);
    
    doc.moveTo(60, yPos + 18)
       .lineTo(300, yPos + 18)
       .strokeColor(color)
       .lineWidth(1)
       .stroke();
    
    return yPos + 35;
  }

  // Helper function to add information rows with page break handling
  function addInfoRow(doc, label, value, yPos) {
    // Check if we need a new page
    if (yPos > doc.page.height - 100) {
      doc.addPage();
      yPos = 60; // Reset Y position for new page
    }
    
    doc.fillColor('#333333')
       .fontSize(11)
       .font('Helvetica-Bold')
       .text(label, 60, yPos);
    
    // Ensure value is not undefined or null
    const displayValue = value || 'Not specified';
    
    doc.font('Helvetica')
       .text(displayValue, 200, yPos, {
         width: doc.page.width - 260,
         align: 'left'
       });
    
    return yPos + 20; // Consistent spacing
  }

  // Helper function to add text boxes with better formatting
  function addTextBox(doc, text, yPos, fillColor, borderColor, textOptions, fontSize) {
    // Ensure text is not empty
    if (!text || text.trim().length === 0) {
      text = 'No additional information provided.';
    }
    
    doc.fontSize(fontSize).font('Helvetica');
    const textHeight = doc.heightOfString(text, textOptions);
    const boxHeight = Math.max(textHeight + 30, 50); // Increased padding for better appearance
    
    // Check if we need a new page
    if (yPos + boxHeight > doc.page.height - 100) {
      doc.addPage();
      yPos = 60; // Reset Y position for new page
    }
    
    doc.rect(60, yPos, doc.page.width - 120, boxHeight)
       .fillAndStroke(fillColor, borderColor)
       .lineWidth(1);
    
    doc.fillColor('#333333')
       .text(text, 70, yPos + 15, textOptions); // Increased top padding
    
    return yPos + boxHeight + 20; // Consistent spacing
  }
};
