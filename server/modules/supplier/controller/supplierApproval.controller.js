import SupplierApprovalService from '../service/supplierApproval.service.js';

// Approve or reject supplier registration
export const approveOrRejectSupplier = async (req, res) => {
  try {
    const { status } = req.body; // status should be 'Approved' or 'Rejected'
    const supplier = await SupplierApprovalService.updateSupplierStatus(req.params.id, status);
    res.status(200).json(supplier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
