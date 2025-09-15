import {
    getAllTransferRequestService,
    getTransferRequestByIdService,
    addTransferRequestService,
    updateTransferRequestService,
    deleteTransferRequestService
} from "../service/transferRequestService.js";

// import {
//     validateTransferRequestInsert,
//     validateTransferRequestUpdate
// } from "../validators/transferRequestValidator.js";

// Example async function to check stock availability
// You should replace it with your real stock check function
const checkStock = async (materialId, location) => {
    // Implement real stock check logic here
    // For now, return a large number to allow any quantity
    return 1000;
};

// Get all transfer requests
export const getAllTransferRequest = async (req, res) => {
    try {
        const transfer_request = await getAllTransferRequestService();
        if (transfer_request.length === 0) {
            return res.status(404).json({ message: "Transfer Request not found" });
        }
        return res.status(200).json({ transfer_request });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Get  by ID
export const getTransferRequestById = async (req, res) => {
  try {
    const request = await getTransferRequestByIdService(req.params.id);
    if (!request) return res.status(404).json({ message: "Transfer Request not found" });
    return res.status(200).json(request);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Add new transfer request
export const addTransferRequest = async (req, res) => {
    try {
        // const errors = await validateTransferRequestInsert(req.body, checkStock);
        // if (errors.length > 0) {
        //     return res.status(400).json({ message: "Validation failed", errors });
        // }

        const transfer_request = await addTransferRequestService(
            req.body,
            req.warehouseManagerName,
            req.managerName
        );
        return res.status(201).json({ message: "Transfer Request added", transfer_request });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Unable to insert data" });
    }
};

// Update transfer request
export const updateTransferRequest = async (req, res) => {
    try {
        // const errors = await validateTransferRequestUpdate(req.body, checkStock);
        // if (errors.length > 0) {
        //     return res.status(400).json({ message: "Validation failed", errors });
        // }

        const transfer_request = await updateTransferRequestService(req.params.id, req.body);
        if (!transfer_request) {
            return res.status(404).json({ message: "Unable to update Transfer Request" });
        }
        return res.status(200).json({ transfer_request });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Delete transfer request
export const deleteTransferRequest = async (req, res) => {
    try {
        const transfer_request = await deleteTransferRequestService(req.params.id);
        if (!transfer_request) {
            return res.status(404).json({ message: "Unable to delete Transfer Request" });
        }
        return res.status(200).json({ transfer_request });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};
