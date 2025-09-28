import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Inventory Event / Audit Log Schema
const auditLogSchema = new Schema({
    logId: { 
        type: String, 
        unique: true 
    },
    entity: { 
        type: String, 
        required: true 
    }, // e.g., "Raw Materials", "Manufactured Products", "Stock Movement", "Disposal Material"
    action: { 
        type: String, 
        required: true,
        enum: ["insert", "update", "delete", "transfer", "dispose"] 
    }, // action performed
    keyInfo: { 
        type: String, 
        required: true 
    }, // human-readable summary of the event
    createdBy: { 
        type: String, 
        required: true 
    }, // user who performed the action
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Counter Schema to auto-generate logId
const auditLogCounterSchema = new Schema({
    seq: { type: Number, default: 0 }
});
const auditLogCounter = mongoose.model("auditLogCounter", auditLogCounterSchema);

// Pre-save hook to auto-generate logId
auditLogSchema.pre("save", async function(next) {
    if (!this.isNew) return next();

    let counter = await auditLogCounter.findOne();
    if (!counter) {
        counter = new auditLogCounter({ seq: 0 });
        await counter.save();
    }

    counter.seq += 1;
    await counter.save();

    const seqNum = counter.seq.toString().padStart(3, "0"); // 001, 002, ...
    this.logId = `LOG${seqNum}`;

    next();
});

export default mongoose.model("auditLogModel", auditLogSchema);
