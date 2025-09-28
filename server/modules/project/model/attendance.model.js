import mongoose from "mongoose";
const { Schema } = mongoose;

const AttendanceSchema = new Schema({
  teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true, index: true },
  status: { type: String, enum: ['present', 'absent', 'late', 'off-duty'], default: 'present' },
  checkIn: { type: Date },
  checkOut: { type: Date },
  reason: { type: String }, // e.g. Medical, Training, Day Off, etc.
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model('Attendance', AttendanceSchema);
