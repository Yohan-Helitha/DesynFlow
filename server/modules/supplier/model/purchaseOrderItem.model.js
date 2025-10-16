import mongoose from "mongoose";
const { Schema } = mongoose;

const PurchaseOrderItemSchema = new Schema({
  materialId: { type: Schema.Types.ObjectId, ref: 'Material' },
  materialName: { type: String },
  qty: { type: Number },
  unit: { type: String }, 
  unitPrice: { type: Number }
}, { _id: false });

export default PurchaseOrderItemSchema;
