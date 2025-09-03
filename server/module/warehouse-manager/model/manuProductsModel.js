import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Counter schema
const counterSchema = new Schema({
    seq: { type: Number, default: 0 }
});

const Counter = mongoose.model("ManuProductsCounter", counterSchema);

const manuProductsSchema = new Schema({
    materialId: { 
        type: String, 
        unique: true 
    },
    materialName: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        required: true 
    },
    unit: { 
        type: String, 
        required: true 
    },
    restockLevel: { 
        type: Number, 
        required: true 
    },
    reorderLevel: { 
        type: Number, 
        required: true 
    },
    currentLevel: { 
        type: Number, 
        required: true 
    },
    warrantyPeriod: {
        type: String,
        required: true,
    },
    inventoryId: { 
        type: String, 
        required: true 
    },
    month: {
        type: String,
        required: true,
        enum: [
            "January","February","March","April","May","June","July","August",
            "September","October","November","December"
        ]
    },
    year: { 
        type: Number, 
        required: true 
    },
    createdBy: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Pre-save hook to auto-fill fields
manuProductsSchema.pre("save", async function(next) {
    if (!this.isNew) return next();

    // ---- Auto-generate materialId (MP001, MP002...) ----
    let counter = await Counter.findOne();
    if (!counter) {
        counter = new Counter({ seq: 0 });
        await counter.save();
    }

    counter.seq += 1;
    await counter.save();

    const seqNum = counter.seq.toString().padStart(3, "0"); // 001, 002, ...
    this.materialId = `MP${seqNum}`;

    // ---- Auto-fill Month & Year ----
    const now = new Date();
    const monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];
    this.month = monthNames[now.getMonth()];
    this.year = now.getFullYear();

    // ---- Auto-fill CreatedBy ----
    this.createdBy = this.createdBy || "System";  

    next();
});

export default mongoose.model("manuProductsModel", manuProductsSchema);
