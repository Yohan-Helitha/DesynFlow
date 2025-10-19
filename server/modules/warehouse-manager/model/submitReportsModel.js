import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Counter schema for auto-increment report IDs
const reportCounterSchema = new Schema({
  seq: { type: Number, default: 0 }
});

const ReportCounter = mongoose.model("reportCounter", reportCounterSchema);

// Submitted Reports schema
const submitReportSchema = new Schema({
  reportId: { 
    type: String, 
    unique: true 
  },
  reportTitle: { 
    type: String, 
    required: true 
  },
  reportFileUrl: { 
    type: String, 
    required: true 
  },
  submittedBy: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Pre-save hook to auto-generate reportId (RPT001, RPT002...)
submitReportSchema.pre("save", async function(next) {
  if (!this.isNew) return next();

  let counter = await ReportCounter.findOne();
  if (!counter) {
    counter = new ReportCounter({ seq: 0 });
    await counter.save();
  }

  counter.seq += 1;
  await counter.save();

  const seqNum = counter.seq.toString().padStart(3, "0"); // 001, 002...
  this.reportId = `RPT${seqNum}`;

  next();
});

export default mongoose.model("submitReportModel", submitReportSchema);
