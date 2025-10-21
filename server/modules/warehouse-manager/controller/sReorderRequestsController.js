import {
    getAllsReorderRequestsService,
    getSReorderRequestByIdService,
    addsReorderRequestsService,
    updatesReorderRequestsService,
    deletesReorderRequestsService
} from "../service/sReorderRequestsService.js";

//import { validateSReorderRequestsInsert, validateSReorderRequestsUpdate } from "../validators/sReorderRequestsValidator.js";

// Get all stock reorder requests
export const getAllsReorderRequests = async (req, res) => {
    try {
        const s_reorder_requests = await getAllsReorderRequestsService();
        if (s_reorder_requests.length === 0) {
            return res.status(404).json({ message: "Stock Reorder Request not found" });
        }
        return res.status(200).json({ s_reorder_requests });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Get  by ID
export const getSReorderRequestById = async (req, res) => {
  try {
    const request = await getSReorderRequestByIdService(req.params.id);
    if (!request) return res.status(404).json({ message: "Stock Reorder Request not found" });
    return res.status(200).json(request);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Add new stock reorder request
export const addsReorderRequests = async (req, res) => {
    try {
        // const errors = await validateSReorderRequestsInsert(req.body, getMaterialStock);
        // if (errors.length > 0) {
        //     return res.status(400).json({ message: "Validation errors", errors });
        // }

        const s_reorder_requests = await addsReorderRequestsService(req.body, req.warehouseManagerName);
        return res.status(201).json({ message: "Stock Reorder Request added", s_reorder_requests });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Unable to insert data" });
    }
};

// Update stock reorder request
export const updatesReorderRequests = async (req, res) => {
    try {
        // const errors = await validateSReorderRequestsUpdate(req.body, getMaterialStock);
        // if (errors.length > 0) {
        //     return res.status(400).json({ message: "Validation errors", errors });
        // }

        // Determine who is updating (could be procurement officer, warehouse manager, etc.)
        const updatedBy = req.user?.role === 'procurement_officer' ? 'Procurement Officer' : 
                          req.user?.role === 'warehouse_manager' ? 'Warehouse Manager' :
                          req.user?.firstName && req.user?.lastName ? `${req.user.firstName} ${req.user.lastName}` :
                          req.userId || 'System User';

        const s_reorder_requests = await updatesReorderRequestsService(req.params.id, req.body, updatedBy);
        if (!s_reorder_requests) {
            return res.status(404).json({ message: "Unable to update Stock Reorder Request" });
        }
        return res.status(200).json({ s_reorder_requests });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Delete stock reorder request
export const deletesReorderRequests = async (req, res) => {
    try {
        const s_reorder_requests = await deletesReorderRequestsService(req.params.id);
        if (!s_reorder_requests) {
            return res.status(404).json({ message: "Unable to delete Stock Reorder Request" });
        }
        return res.status(200).json({ s_reorder_requests });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};
