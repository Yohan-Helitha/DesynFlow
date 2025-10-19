import PurchaseOrderService from '../service/purchaseOrder.service.js';
import sReorderRequestsModel from '../../warehouse-manager/model/sReorderRequestsModel.js';

// Create material request
export const createPurchaseOrder = async (req, res) => {
  try {
    console.log('Received order data:', JSON.stringify(req.body, null, 2));
    const order = await PurchaseOrderService.createPurchaseOrder(req.body);
    console.log('Created order:', JSON.stringify(order, null, 2));
    res.status(201).json(order);
  } catch (err) {
    // Return specific validation errors
    res.status(400).json({ error: err.message || 'Order creation failed' });
  }
};

// Update material request
export const updatePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrderService.updatePurchaseOrder(req.params.id, req.body);
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all material requests
export const getPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrderService.getAllPurchaseOrders();
    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Forward for finance approval
export const forwardToFinance = async (req, res) => {
  try {
    const order = await PurchaseOrderService.forwardToFinance(req.params.id);
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Approve or reject finance
export const financeApproval = async (req, res) => {
  try {
    const order = await PurchaseOrderService.financeApproval(req.params.id, req.body);
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get approval status
export const getApprovalStatus = async (req, res) => {
  try {
    const status = await PurchaseOrderService.getApprovalStatus(req.params.id);
    res.status(200).json(status);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Mark order as received and update related reorder request
export const markAsReceivedAndUpdateReorder = async (req, res) => {
  try {
    console.log('Marking order as received:', req.params.id);
    
    // Update purchase order status to 'Received'
    const order = await PurchaseOrderService.updatePurchaseOrder(req.params.id, { status: 'Received' });
    console.log('Order updated:', order);
    
    // Update related reorder request to 'Restocked' if this order was created from a reorder request
    if (order.reorderRequestId) {
      try {
        const reorderUpdate = await sReorderRequestsModel.findOneAndUpdate(
          { 
            stockReorderRequestId: order.reorderRequestId,
            status: { $in: ['Pending', 'Approved'] } // Only update pending/approved requests
          },
          { status: 'Restocked' },
          { new: true }
        );
        
        if (reorderUpdate) {
          console.log('Successfully updated reorder request:', reorderUpdate.stockReorderRequestId);
          res.status(200).json({ 
            message: 'Order marked as received and reorder request updated to Restocked',
            order,
            updatedReorderRequest: reorderUpdate.stockReorderRequestId
          });
        } else {
          console.warn('No matching reorder request found for:', order.reorderRequestId);
          res.status(200).json({ 
            message: 'Order marked as received, but no matching reorder request found',
            order 
          });
        }
      } catch (reorderErr) {
        // Log error but don't fail the main operation
        console.warn('Failed to update reorder request status:', reorderErr);
        res.status(200).json({ 
          message: 'Order marked as received, but failed to update reorder request',
          order,
          reorderError: reorderErr.message
        });
      }
    } else {
      // Order not created from reorder request
      res.status(200).json({ 
        message: 'Order marked as received (not from reorder request)',
        order 
      });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
