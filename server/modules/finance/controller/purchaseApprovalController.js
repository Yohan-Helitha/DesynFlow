import * as service from '../service/purchaseApprovalService.js';

export async function list(req, res) {
  try {
    const { status } = req.query; // e.g., Pending | Approved | Rejected
    const approvals = await service.getApprovalsByStatus(status);
    res.json(approvals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export default { list };
