const PurchaseOrder = require('../model/purchase_order');

// Approve or reject material purchase request
exports.financeApproval = async ({ orderId, status, approverId, note }) => {
	if (!['Approved', 'Rejected'].includes(status)) {
		throw new Error('Invalid status');
	}
	const order = await PurchaseOrder.findById(orderId);
	if (!order) throw new Error('Order not found');
	order.status = status === 'Approved' ? 'Approved' : 'Rejected';
	order.financeApproval = {
		approverId,
		status,
		note,
		approvedAt: new Date()
	};
	await order.save();
	return order;
};

// Get material purchase history (not rejected)
exports.getPurchaseHistory = async () => {
	return await PurchaseOrder.find({ status: { $ne: 'Rejected' } });
};

