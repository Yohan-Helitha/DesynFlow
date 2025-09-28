
import mongoose from "mongoose";
const { Schema } = mongoose;

const SupplierRatingSchema = new Schema({
  supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
  ratedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  criteria: {
    timeliness: { type: Number, min: 0, max: 5 },
    quality: { type: Number, min: 0, max: 5 },
    communication: { type: Number, min: 0, max: 5 }
  },
  weightedScore: { type: Number }
}, { timestamps: true });
SupplierRatingSchema.index({ supplierId: 1 });

const SupplierRating = mongoose.model('SupplierRating', SupplierRatingSchema);
export default SupplierRating;
