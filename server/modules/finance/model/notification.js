import mongoose from 'mongoose';
const { Schema } = mongoose;

const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  message: { type: String, required: true },
  type: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Notification', NotificationSchema);
