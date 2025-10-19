
import mongoose from "mongoose";
const { Schema } = mongoose;

const WarrantyClaimSchema = new Schema({
    warrantyId: { type: Schema.Types.ObjectId, ref: 'Warranty', index: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'User' },
    issueDescription: { type: String },
    proofUrl: { type: String },
    status: { type: String, enum: ['Submitted', 'UnderReview', 'Approved', 'Rejected', 'Replaced'], default: 'Submitted', index: true },
    financeReviewerId: { type: Schema.Types.ObjectId, ref: 'User' },
    warehouseAction: {
      shippedReplacement: { type: Boolean, default: false },
      shippedAt: { type: Date }
    }
}, { timestamps: true });

export default mongoose.model('WarrantyClaim', WarrantyClaimSchema);
