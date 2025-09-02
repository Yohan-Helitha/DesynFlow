import mongoose from "mongoose";
const PurchaseOrderItemSchema = new Schema({
  materialId: { type: Schema.Types.ObjectId, ref: 'Material' },
  qty: { type: Number },
  unitPrice: { type: Number }
}, { _id: false });
