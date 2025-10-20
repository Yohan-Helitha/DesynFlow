import mongoose from "mongoose";
const Schema = mongoose.Schema;

const warehouseNotificationSchema = new Schema({
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String },
  relatedId: { type: String }, // materialId, stockReorderRequestId, etc.
  data: { type: Schema.Types.Mixed },
  recipient: { type: String, default: "warehouse" }, // can be user id or role
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String }
});

warehouseNotificationSchema.index({ recipient: 1, isRead: 1 });
warehouseNotificationSchema.index({ createdAt: -1 });

export default mongoose.model("WarehouseNotification", warehouseNotificationSchema);
