import mongoose from 'mongoose';
const { Schema } = mongoose;

// Minimal User schema to satisfy references from finance module.
// You can extend this later with auth fields.
const UserSchema = new Schema({
  name: { type: String, required: false },
  email: { type: String, required: false, index: true },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
