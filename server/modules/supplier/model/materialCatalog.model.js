import mongoose from "mongoose";
const { Schema } = mongoose;

const SupplierMaterialCatalogSchema = new Schema({
  supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', index: true },
  materialId: { type: Schema.Types.ObjectId, ref: 'Material', index: true },
  pricePerUnit: { type: Number },
  leadTimeDays: { type: Number },
  active: { type: Boolean, default: true }
}, { timestamps: true });
SupplierMaterialCatalogSchema.index({ supplierId: 1, materialId: 1 }, { unique: true });

const MaterialCatalog = mongoose.model('MaterialCatalog', SupplierMaterialCatalogSchema);
export default MaterialCatalog;
