import mongoose from "mongoose";

const MeetingSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
  withClientId: { type: Schema.Types.ObjectId, ref: 'User' },
  channel: { type: String, enum: ['Zoom', 'Teams', 'Phone', 'InPerson'] },
  scheduledAt: { type: Date, index: true },
  notes: { type: String }
}, { timestamps: true });
