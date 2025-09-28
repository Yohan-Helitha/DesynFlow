import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Stock Movement Counter schema
const stockMovementcounterSchema = new Schema({
    seq: { type: Number, default: 0 }
});

const stockMovementCounter = mongoose.model("stockMovementCounter", stockMovementcounterSchema);

const stockMovementSchema = new Schema({
    stockId: { 
        type: String, 
        unique: true 
    },
    materialId: { 
        type: String, 
        required: true 
    },
    fromLocation: { 
        type: String, 
        required: true 
    },
    toLocation: { 
        type: String, 
        required: true 
    },
    unit: { 
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
    employeeId: { 
        type: String, 
        required: true 
    },
    vehicleInfo: {
        type: String,
        required: true
    },
    dispatchedDate: {
        type: Date,
        required: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Pre-save hook to auto-fill fields
stockMovementSchema.pre("save", async function(next) {
    if (!this.isNew) return next();

    // ---- Auto-generate materialId (MP001, MP002...) ----
    let smcounter = await stockMovementCounter.findOne();
    if (!smcounter) {
        smcounter = new stockMovementCounter({ seq: 0 });
        await smcounter.save();
    }

    smcounter.seq += 1;
    await smcounter.save();

    const seqNum = smcounter.seq.toString().padStart(3, "0"); // 001, 002, ...
    this.stockId = `SM${seqNum}`;  

    next();
});

export default mongoose.model("stockMovementModel", stockMovementSchema);
