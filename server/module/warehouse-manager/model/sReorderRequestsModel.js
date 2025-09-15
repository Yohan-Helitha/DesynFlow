import mongoose from "mongoose";
const Schema = mongoose.Schema;

// stock reorder request Counter schema
const sReorderRequestscounterSchema = new Schema({
    seq: { type: Number, default: 0 }
});

const sReorderRequestsCounter = mongoose.model("sReorderRequestsCounter", sReorderRequestscounterSchema);

const sReorderRequestsSchema = new Schema({
    stockReorderRequestId: { 
        type: String, 
        unique: true 
    },
    inventoryId: { 
        type: String, 
        required: true 
    },
    materialId: { 
        type: String, 
        required: true 
    },
    materialName: { 
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
    expectedDate: { 
        type: Date, 
        required: true 
    },
    warehouseManagerName: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    status: { 
        type: String, 
        required: true,
        default:"Pending" 
    }
});

// Pre-save hook to auto-fill fields
sReorderRequestsSchema.pre("save", async function(next) {
    if (!this.isNew) return next();

    // ---- Auto-generate materialId (MP001, MP002...) ----
    let srrcounter = await sReorderRequestsCounter.findOne();
    if (!srrcounter) {
        srrcounter = new sReorderRequestsCounter({ seq: 0 });
        await srrcounter.save();
    }

    srrcounter.seq += 1;
    await srrcounter.save();

    const seqNum = srrcounter.seq.toString().padStart(3, "0"); // 001, 002, ...
    this.stockReorderRequestId = `SRR${seqNum}`;

    // ---- Auto-fill CreatedBy ----
    this.createdBy = this.createdBy || "System";  

    next();
});

export default mongoose.model("sReorderRequestsModel", sReorderRequestsSchema);
