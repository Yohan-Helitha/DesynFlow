// Project Manager Controller for Quotation Management  
// This controller safely imports from finance module without modifying it

import * as quotationController from '../../finance/controller/quotationController.js';
import Quotation from '../../finance/model/quotation_estimation.js';

// Get all quotations for Project Manager dashboard (only 'Sent' status)
export const getAllQuotationsForPM = async (req, res) => {
  try {
    const quotations = await Quotation.find({ status: 'Sent' })
      .populate('projectId', 'projectName status')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('sentTo', 'name email')
      .sort({ createdAt: -1 }); // Newest first
    
    res.status(200).json(quotations);
  } catch (error) {
    console.error('Error fetching quotations for PM:', error);
    res.status(500).json({ 
      message: 'Failed to fetch quotations', 
      error: error.message 
    });
  }
};

// Get specific quotation details for PM view
export const getQuotationDetails = async (req, res) => {
  try {
    const { quotationId } = req.params;
    const quotation = await Quotation.findById(quotationId)
      .populate('projectId', 'projectName status description')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('sentTo', 'name email')
      .populate('materialItems.materialId');
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    res.status(200).json(quotation);
  } catch (error) {
    console.error('Error fetching quotation details:', error);
    res.status(500).json({ 
      message: 'Failed to fetch quotation details', 
      error: error.message 
    });
  }
};

// PM-specific approve quotation (Sent → Confirmed → Locked)
export const approveQuotation = async (req, res) => {
  try {
    const { quotationId } = req.params;
    const { remarks } = req.body;
    
    // First check if quotation exists and is in 'Sent' status
    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    if (quotation.status !== 'Sent') {
      return res.status(400).json({ 
        message: `Cannot approve quotation. Current status: ${quotation.status}. Only 'Sent' quotations can be approved.` 
      });
    }
    
    if (quotation.locked) {
      return res.status(400).json({ 
        message: 'Quotation is already locked and cannot be modified' 
      });
    }
    
    // Add PM approval details to existing remarks field
    const pmApprovalInfo = `\n\n--- PM APPROVED ---\nApproved by: ${req.user?.name || req.user?.email || 'Project Manager'}\nApproval Date: ${new Date().toISOString()}\nRemarks: ${remarks || 'Approved by Project Manager'}`;
    const updatedRemarks = `${quotation.remarks || ''}${pmApprovalInfo}`;
    
    await Quotation.findByIdAndUpdate(quotationId, {
      remarks: updatedRemarks,
      updatedBy: req.user?.id || req.user?._id
    });
    
    // Use the existing lockQuotation function (Sent → Confirmed → Locked)
    await quotationController.lockQuotation({
      ...req,
      params: { quotationId }
    }, res);
  } catch (error) {
    console.error('Error approving quotation:', error);
    res.status(500).json({ 
      message: 'Failed to approve quotation', 
      error: error.message 
    });
  }
};

// PM-specific reject quotation (Sent → Revised via new version)
export const rejectQuotation = async (req, res) => {
  try {
    const { quotationId } = req.params;
    const { remarks } = req.body;
    
    // Remarks are required for rejection
    if (!remarks || remarks.trim() === '') {
      return res.status(400).json({ 
        message: 'Remarks are required when rejecting a quotation' 
      });
    }
    
    // First check if quotation exists and is in 'Sent' status
    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    if (quotation.status !== 'Sent') {
      return res.status(400).json({ 
        message: `Cannot reject quotation. Current status: ${quotation.status}. Only 'Sent' quotations can be rejected.` 
      });
    }
    
    if (quotation.locked) {
      return res.status(400).json({ 
        message: 'Quotation is already locked and cannot be modified' 
      });
    }
    
    // Add PM rejection details to existing remarks field  
    const pmRejectionInfo = `\n\n--- PM REJECTED ---\nRejected by: ${req.user?.name || req.user?.email || 'Project Manager'}\nRejection Date: ${new Date().toISOString()}\nRemarks: ${remarks.trim()}`;
    const updatedRemarks = `${quotation.remarks || ''}${pmRejectionInfo}`;
    
    await Quotation.findByIdAndUpdate(quotationId, {
      remarks: updatedRemarks,
      updatedBy: req.user?.id || req.user?._id
    });
    
    // Create revised version using existing reviseQuotation function
    req.body = {
      laborItems: quotation.laborItems,
      materialItems: quotation.materialItems,
      serviceItems: quotation.serviceItems,
      contingencyItems: quotation.contingencyItems,
      taxes: quotation.taxes,
      remarks: `${quotation.remarks || ''}\n\n--- PM Rejection ---\n${remarks.trim()}`,
      updatedBy: req.user?.id || req.user?._id
    };
    
    // Use the existing reviseQuotation function (creates new version with 'Revised' status)
    await quotationController.reviseQuotation({
      ...req,
      params: { quotationId }
    }, res);
  } catch (error) {
    console.error('Error rejecting quotation:', error);
    res.status(500).json({ 
      message: 'Failed to reject quotation', 
      error: error.message 
    });
  }
};