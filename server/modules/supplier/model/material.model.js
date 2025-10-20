import mongoose from "mongoose";
const { Schema } = mongoose;

const materialSchema = new Schema({
  materialId: { type: String, unique: true, required: true, index: true },
  materialName: { type: String, required: true },
  category: { type: String, required: true },
  type: { type: String, required: true },
  unit: { type: String, required: true },
  warrantyPeriod: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Material = mongoose.model("Material", materialSchema);
export default Material;
