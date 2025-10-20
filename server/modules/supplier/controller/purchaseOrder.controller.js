import PurchaseOrderService from '../service/purchaseOrder.service.js';
import sReorderRequestsModel from '../../warehouse-manager/model/sReorderRequestsModel.js';
import Supplier from '../model/supplier.model.js';

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
    console.log('getPurchaseOrders called, path:', req.path);
    console.log('Query params:', req.query);
    console.log('Headers:', req.headers['x-user-data']);
    
    const { status } = req.query;
    
    // Check if this is the /mine endpoint (supplier-specific orders)
    const isMineEndpoint = req.path.includes('/mine');
    console.log('Is mine endpoint:', isMineEndpoint);
    
    let supplierId = null;
    if (isMineEndpoint) {
      // Get current user from JWT token, session, or headers
      let userId = req.user?.id || req.session?.user?.id;
      let userEmail = req.user?.email || req.session?.user?.email;
      
      // Try to get from query params if not in session
      if (!userId && !userEmail) {
        userId = req.query.userId;
        userEmail = req.query.userEmail;
      }
      
      // Try to get from headers (sent by frontend)
      if (!userId && !userEmail) {
        const userDataHeader = req.headers['x-user-data'];
        if (userDataHeader) {
          try {
            const userData = JSON.parse(userDataHeader);
            console.log('User data from header:', userData);
          
            // Check if this is a supplier ID based on userType
            if (userData.userType === 'supplier' && userData.id) {
              console.log('User data indicates this is a supplier, using ID directly:', userData.id);
              supplierId = userData.id;
              console.log('Set supplierId from userData:', supplierId);
              // Skip the user lookup and supplier search logic
            } else {
              // Store for traditional user lookup
              userId = userData.id;
              userEmail = userData.email;
            }
          } catch (parseErr) {
            console.error('Error parsing user data header:', parseErr);
          }
        }
      }
      
      // Only proceed with user lookup if we don't already have supplierId
      if (!supplierId) {
        if (!userId && !userEmail) {
          console.log('No user authentication found');
          return res.status(401).json({ error: 'Authentication required' });
        }
        
        // Dynamic import for User model (to avoid circular dependencies)
        const User = (await import('../../auth/model/user.model.js')).default;
        
        let user = null;
        if (userId) {
          user = await User.findById(userId);
        } else if (userEmail) {
          user = await User.findOne({ email: userEmail });
        }
        
        console.log('Found user:', user);
        
        if (!user) {
          // If no user found, try to find supplier directly by email
          console.log('No user found, trying to find supplier by email:', userEmail);
          const supplier = await Supplier.findOne({ email: userEmail });
          console.log('Found supplier by email:', supplier ? 'Yes' : 'No');
          
          if (supplier) {
            supplierId = supplier._id;
          } else {
            return res.status(404).json({ error: 'Supplier not found' });
          }
        } else {
          const supplier = await Supplier.findOne({
            $or: [
              { userId: user._id },
              { email: user.email }
            ]
          });
          
          console.log('Found supplier for user:', supplier ? 'Yes' : 'No');
          
          if (!supplier) {
            return res.status(404).json({ error: 'Supplier profile not found' });
          }
          
          supplierId = supplier._id;
        }
      }
    }
    
    console.log('Fetching orders with supplierId:', supplierId);
    const orders = await PurchaseOrderService.getAllPurchaseOrders(status, supplierId);
    console.log('Found orders count:', orders.length);
    
    res.status(200).json(orders);
  } catch (err) {
    console.error('Error in getPurchaseOrders:', err);
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
