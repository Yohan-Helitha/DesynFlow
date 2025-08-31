const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controller/purchaseOrderController');

// Approve/reject material purchase request
router.post('/purchase-order/:orderId/finance-approval', purchaseOrderController.financeApproval);

// Get material purchase history
router.get('/purchase-order/history', purchaseOrderController.getPurchaseHistory);

module.exports = router;
