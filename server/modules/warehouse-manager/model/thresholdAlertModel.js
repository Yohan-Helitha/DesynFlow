import mongoose from "mongoose";
const Schema = mongoose.Schema;

// threshold alert Counter schema
const thresholdAlertcounterSchema = new Schema({
    seq: { type: Number, default: 0 }
});

const thresholdAlertCounter = mongoose.model("thresholdAlertCounter", thresholdAlertcounterSchema);

const thresholdAlertSchema = new Schema({
    alertId: {
        type: String,
        unique: true
    },
    materialId: {
        type: String,
        required: true
    },
    materialName: {
        type: String,
        required: true
    },
    currentLevel: {
        type: Number,
        required: true
    },
    restockLevel: {
        type: Number,
        required: true
    },
    // inventoryId: {
    //     type: String,
    //     required: true
    // },
    inventoryName: {
        type: String,
        required: true
    },
    alertDate: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook to auto-fill fields
thresholdAlertSchema.pre("save", async function(next) {
    if (!this.isNew) return next();

    // ---- Auto-generate materialId (MP001, MP002...) ----
    let tacounter = await thresholdAlertCounter.findOne();
    if (!tacounter) {
        tacounter = new thresholdAlertCounter({ seq: 0 });
        await tacounter.save();
    }

    tacounter.seq += 1;
    await tacounter.save();

    const seqNum = tacounter.seq.toString().padStart(3, "0"); // 001, 002, ...
    this.alertId  = `TA${seqNum}`;  

    next();
});

export default mongoose.model("thresholdAlertModel", thresholdAlertSchema);
