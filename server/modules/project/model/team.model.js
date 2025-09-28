import mongoose from "mongoose";
const { Schema } = mongoose;

const TeamMemberSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String },
  availability: { type: String, enum: ['Available', 'Busy', 'On Leave'], default: 'Available' },
  workload: { type: Number, default: 0 } // percentage or hours
}, { _id: false });

const TeamSchema = new Schema({
  teamId : { type: Schema.Types.ObjectId, required: true },
  teamName: { type: String },
  leaderId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  members: [TeamMemberSchema],
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Team', TeamSchema);
