// Project Manager Controller for Budget Management
// This controller safely imports from finance module without modifying it

import * as financeController from '../../finance/controller/projectEstimationController.js';
import ProjectEstimation from '../../finance/model/project_estimation.js';

// Get all estimations for Project Manager dashboard (with project details)
export const getAllEstimationsForPM = async (req, res) => {
  try {
    const estimations = await ProjectEstimation.find()
      .populate('projectId', 'projectName status')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .sort({ createdAt: -1 }); // Newest first
    
    res.status(200).json(estimations);
  } catch (error) {
    console.error('Error fetching estimations for PM:', error);
    res.status(500).json({ 
      message: 'Failed to fetch estimations', 
      error: error.message 
    });
  }
};

// Get specific estimation details for PM view
export const getEstimationDetails = async (req, res) => {
  try {
    const { estimationId } = req.params;
    const estimation = await ProjectEstimation.findById(estimationId)
      .populate('projectId', 'projectName status description')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email');
    
    if (!estimation) {
      return res.status(404).json({ message: 'Estimation not found' });
    }
    
    res.status(200).json(estimation);
  } catch (error) {
    console.error('Error fetching estimation details:', error);
    res.status(500).json({ 
      message: 'Failed to fetch estimation details', 
      error: error.message 
    });
  }
};

// PM-specific approve estimation (wraps finance controller with PM context)
export const approveEstimation = async (req, res) => {
  try {
    const { estimationId } = req.params;
    const { remarks } = req.body;
    
    // Use the existing finance controller but with PM-specific body structure
    req.body = {
      status: 'Approved',
      remarks: remarks || 'Approved by Project Manager'
    };
    
    // Call the existing finance controller function
    await financeController.updateEstimateStatus({
      ...req,
      params: { estimateId: estimationId }
    }, res);
  } catch (error) {
    console.error('Error approving estimation:', error);
    res.status(500).json({ 
      message: 'Failed to approve estimation', 
      error: error.message 
    });
  }
};

// PM-specific reject estimation (requires remarks)
export const rejectEstimation = async (req, res) => {
  try {
    const { estimationId } = req.params;
    const { remarks } = req.body;
    
    // Remarks are required for rejection
    if (!remarks || remarks.trim() === '') {
      return res.status(400).json({ 
        message: 'Remarks are required when rejecting an estimation' 
      });
    }
    
    // Use the existing finance controller but with PM-specific body structure
    req.body = {
      status: 'Rejected',
      remarks: remarks.trim()
    };
    
    // Call the existing finance controller function
    await financeController.updateEstimateStatus({
      ...req,
      params: { estimateId: estimationId }
    }, res);
  } catch (error) {
    console.error('Error rejecting estimation:', error);
    res.status(500).json({ 
      message: 'Failed to reject estimation', 
      error: error.message 
    });
  }
};