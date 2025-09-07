import mongoose from "mongoose";
const Schema = mongoose.Schema;

// disposal materials Counter schema
const disposalMaterialscounterSchema = new Schema({
    seq: { type: Number, default: 0 }
});

const disposalMaterialsCounter = mongoose.model("disposalMaterialsCounter", disposalMaterialscounterSchema);

const disposalMaterialsSchema = new Schema({
    disposalId: { 
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
    inventoryId: { 
        type: String, 
        required: true 
    },
    quantity: { 
        type: Number, 
        required: true 
    },
    type: { 
        type: String, 
        required: true 
    },
    requestedBy: { 
        type: String, 
        required: true 
    },
    reasonOfDisposal: { 
        type: String, 
        required: true 
    },
    approvedBy: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Pre-save hook to auto-fill fields
disposalMaterialsSchema.pre("save", async function(next) {
    if (!this.isNew) return next();

    // ---- Auto-generate materialId (MP001, MP002...) ----
    let dmcounter = await disposalMaterialsCounter.findOne();
    if (!dmcounter) {
        dmcounter = new disposalMaterialsCounter({ seq: 0 });
        await dmcounter.save();
    }

    dmcounter.seq += 1;
    await dmcounter.save();

    const seqNum = dmcounter.seq.toString().padStart(3, "0"); // 001, 002, ...
    this.disposalId = `DM${seqNum}`;

    next();
});

export default mongoose.model("disposalMaterialsModel", disposalMaterialsSchema);
