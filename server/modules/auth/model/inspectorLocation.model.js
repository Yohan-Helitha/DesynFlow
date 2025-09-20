import mongoose from 'mongoose';

const inspectorLocationSchema = new mongoose.Schema({
  inspector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coordinates: {
    type: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'available'
  }
});

export default mongoose.model('InspectorLocation', inspectorLocationSchema);