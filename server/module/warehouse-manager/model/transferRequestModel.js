import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Transfer Request Counter schema
const transferRequestcounterSchema = new Schema({
    seq: { type: Number, default: 0 }
});

const transferRequestCounter = mongoose.model("transferRequestCounter", transferRequestcounterSchema);

const transferRequestSchema = new Schema({
    transferRequestId: { 
        type: String, 
        unique: true 
    },
    materialId: { 
        type: String, 
        required:true 
    },
    fromLocation: { 
        type: String, 
        required: true 
    },
    toLocation: { 
        type: String, 
        required: true 
    },
    quantity: { 
        type: Number, 
        required: true 
    },
    reason: { 
        type: String, 
        required: true 
    },
    requestedBy: { 
        type: String, 
        required: true 
    },
    approvedBy: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        required: true,
        default: "Pending" 
    },
    requiredBy: {
        type: Date,
        required: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: {
        type: Date, 
        default: null
    }
});

// Pre-save hook to auto-fill fields
transferRequestSchema.pre("save", async function(next) {
    if (!this.isNew) return next();

    // ---- Auto-generate materialId (MP001, MP002...) ----
    let trcounter = await transferRequestCounter.findOne();
    if (!trcounter) {
        trcounter = new transferRequestCounter({ seq: 0 });
        await trcounter.save();
    }

    trcounter.seq += 1;
    await trcounter.save();

    const seqNum = trcounter.seq.toString().padStart(3, "0"); // 001, 002, ...
    this.transferRequestId  = `TR${seqNum}`;  

    next();
});

export default mongoose.model("transferRequestModel", transferRequestSchema);
