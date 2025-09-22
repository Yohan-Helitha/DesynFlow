import mongoose from "mongoose";
import mongoose from "mongoose";
const { Schema } = mongoose;

const PurchaseOrderItemSchema = new Schema({
  materialId: { type: Schema.Types.ObjectId, ref: 'Material' },
  qty: { type: Number },
  unitPrice: { type: Number }
}, { _id: false });

export default PurchaseOrderItemSchema;
