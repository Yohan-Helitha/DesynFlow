import WarrantyClaim from "../model/warrantyClaimsModel.js";
import AuditLog from "../model/auditLogModel.js";

// Get all warranty claims
export const getAllWarrantyClaimsService = async () => {
    return await WarrantyClaim.find();
};

// Get a warranty claim by ID
export const getWarrantyClaimByIdService = async (id) => {
    const claim = await WarrantyClaim.findById(id);
    return claim; // null if not found
};

// Update warranty claim
export const updateWarrantyClaimService = async (id, data, managerName) => {
    let warranty_claim = await WarrantyClaim.findByIdAndUpdate(
        id,
        {
            ...data,
            updatedAt: Date.now(),
            reviewedBy: managerName, // manager approving or updating claim
        },
        { new: true }
    );

    if (!warranty_claim) return null;

    await warranty_claim.save();

    // Convert Mongoose document to plain object
    const rawData = warranty_claim.toObject ? warranty_claim.toObject() : warranty_claim;

    // Create keyInfo object for logging
    const keyInfo = {
        WarrantyClaimID: rawData.warrantyClaimId,
        ProductID: rawData.productId,
        CustomerID: rawData.customerId,
        PurchaseDate: rawData.purchaseDate,
        ClaimDate: rawData.claimDate,
        IssueDescription: rawData.issueDescription,
        Status: rawData.status,
        ReviewedBy: rawData.reviewedBy,
        UpdatedAt: rawData.updatedAt
    };

    await AuditLog.create({
        entity: "Warranty Claim",
        action: "update",
        keyInfo: JSON.stringify(keyInfo),
        createdBy: data.reviewedBy || "Manager001"
    });

    return warranty_claim;
};
