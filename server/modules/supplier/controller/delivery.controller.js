import DeliveryService from '../service/delivery.service.js';

// Update delivery status (e.g., Delivered)
export const updateDeliveryStatus = async (req, res) => {
  try {
    const statusUpdate = await DeliveryService.updateDeliveryStatus(req.body);
    res.status(200).json(statusUpdate);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Track live status of orders
export const getOrderStatus = async (req, res) => {
  try {
    const status = await DeliveryService.getOrderStatus(req.params.purchaseOrderId);
    res.status(200).json(status);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update delivery location
export const updateDeliveryLocation = async (req, res) => {
  try {
    const location = await DeliveryService.updateDeliveryLocation(req.params.purchaseOrderId, req.body.location);
    res.status(200).json(location);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get delivery location
export const getDeliveryLocation = async (req, res) => {
  try {
    const location = await DeliveryService.getDeliveryLocation(req.params.purchaseOrderId);
    res.status(200).json(location);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
