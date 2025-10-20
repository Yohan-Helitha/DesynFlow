import {
    getAllMaterialRequestsService,
    getMaterialRequestByIdService,
    updateMaterialRequestService,
} from '../service/materialRequestsService.js';

// Get all material requests
export const getAllMaterialRequests = async (req, res) => {
    try {
        const materialRequests = await getAllMaterialRequestsService();
        if (materialRequests.length === 0) {
            return res.status(404).json({ message: "Material Requests not found" });
        }
        return res.status(200).json({ materialRequests });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Get single material request by ID
export const getMaterialRequestById = async (req, res) => {
    try {
        const materialRequest = await getMaterialRequestByIdService(req.params.id);
        if (!materialRequest) return res.status(404).json({ message: "Material Request not found" });
        return res.status(200).json(materialRequest);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Update material request
export const updateMaterialRequest = async (req, res) => {
    try {
        const materialRequest = await updateMaterialRequestService(req.params.id, req.body, req.userId);

        if (!materialRequest) {
            return res.status(404).json({ message: "Unable to update Material Request" });
        }

        return res.status(200).json({ materialRequest });
    } catch (err) {
        console.error(err);
        if (err.status === 400 && err.errors) {
            return res.status(400).json({ errors: err.errors });
        }
        return res.status(500).json({ message: "Server error" });
    }
};
