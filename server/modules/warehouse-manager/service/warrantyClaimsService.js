import WarrantyClaim from "../../finance/model/warrenty_claim.js";
import AuditLog from "../model/auditLogModel.js";

// Get all warranty claims with populated warranty and material data
export const getAllWarrantyClaimsService = async () => {
    return await WarrantyClaim.find()
        .populate({
            path: 'warrantyId',
            populate: {
                path: 'itemId',
                select: 'materialName category type unit'
            },
            select: 'projectId clientId itemId warrantyStart warrantyEnd status'
        })
        .populate('clientId', 'name username email')
        .sort({ createdAt: -1 });
};

// Get a warranty claim by ID with populated warranty and material data
export const getWarrantyClaimByIdService = async (id) => {
    const claim = await WarrantyClaim.findById(id)
        .populate({
            path: 'warrantyId',
            populate: {
                path: 'itemId',
                select: 'materialName category type unit'
            },
            select: 'projectId clientId itemId warrantyStart warrantyEnd status'
        })
        .populate('clientId', 'name username email');
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

// Update shipping information for warranty claim
export const updateShippingInfoService = async (id, shippingData, managerName) => {
    const warranty_claim = await WarrantyClaim.findByIdAndUpdate(
        id,
        {
            'warehouseAction.shippedReplacement': shippingData.shippedReplacement,
            'warehouseAction.shippedAt': shippingData.shippedReplacement ? new Date() : null,
            updatedAt: Date.now(),
            reviewedBy: managerName
        },
        { new: true }
    ).populate({
        path: 'warrantyId',
        populate: {
            path: 'itemId',
            select: 'materialName category type unit'
        }
    });

    if (!warranty_claim) return null;

    // Log the shipping action
    await AuditLog.create({
        entity: "Warranty Claim Shipping",
        action: shippingData.shippedReplacement ? "mark_shipped" : "unmark_shipped", 
        keyInfo: JSON.stringify({
            WarrantyClaimID: warranty_claim._id,
            ShippedReplacement: shippingData.shippedReplacement,
            ShippedAt: warranty_claim.warehouseAction?.shippedAt,
            UpdatedBy: managerName
        }),
        createdBy: managerName || "WarehouseManager"
    });

    return warranty_claim;
};
