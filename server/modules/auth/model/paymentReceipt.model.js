import mongoose from "mongoose";
import crypto from "crypto";

const paymentReceiptSchema = new mongoose.Schema(
  {
    inspectionRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InspectionRequest",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    calculatedAmount: {
      type: Number,
      required: true,
    },
    paymentDueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["awaiting_upload", "uploaded", "verified", "rejected"],
      default: "awaiting_upload",
    },

    // One-time upload link
    uploadToken: {
      type: String,
      default: () => crypto.randomBytes(16).toString("hex"),
      unique: true,
    },
    tokenExpires: {
      type: Date,
      required: true,
    },

    // Email + verification tracking
    emailSentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    emailSentAt: { type: Date },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("PaymentReceipt", paymentReceiptSchema);
