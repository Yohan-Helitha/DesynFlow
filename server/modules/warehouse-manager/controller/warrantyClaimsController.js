import {
    getAllWarrantyClaimsService,
    getWarrantyClaimByIdService,
    updateWarrantyClaimService,
    updateShippingInfoService,
} from "../service/warrantyClaimsService.js";

const checkWarrantyValidity = async (productId) => {
    // Implement logic to verify warranty validity
    // For now, assume it's always valid
    return true;
};

// Get all warranty claims
export const getAllWarrantyClaims = async (req, res) => {
    try {
        const warranty_claims = await getAllWarrantyClaimsService();
        if (warranty_claims.length === 0) {
            return res.status(404).json({ message: "No warranty claims found" });
        }
        return res.status(200).json({ warranty_claims });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Get warranty claim by ID
export const getWarrantyClaimById = async (req, res) => {
    try {
        const claim = await getWarrantyClaimByIdService(req.params.id);
        if (!claim) return res.status(404).json({ message: "Warranty claim not found" });
        return res.status(200).json(claim);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};


// Update warranty claim
export const updateWarrantyClaim = async (req, res) => {
    try {
        // const errors = await validateWarrantyClaimUpdate(req.body);
        // if (errors.length > 0) {
        //     return res.status(400).json({ message: "Validation failed", errors });
        // }

        const warranty_claim = await updateWarrantyClaimService(req.params.id, req.body, req.managerName);
        if (!warranty_claim) {
            return res.status(404).json({ message: "Unable to update warranty claim" });
        }
        return res.status(200).json({ warranty_claim });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Update shipping information for warranty claim
export const updateShippingInfo = async (req, res) => {
    try {
        const { shippedReplacement } = req.body;
        
        if (typeof shippedReplacement !== 'boolean') {
            return res.status(400).json({ message: "shippedReplacement must be a boolean value" });
        }

        const warranty_claim = await updateShippingInfoService(
            req.params.id, 
            { shippedReplacement }, 
            req.managerName || "WarehouseManager"
        );
        
        if (!warranty_claim) {
            return res.status(404).json({ message: "Warranty claim not found" });
        }
        
        return res.status(200).json({ 
            message: "Shipping information updated successfully",
            warranty_claim 
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};
