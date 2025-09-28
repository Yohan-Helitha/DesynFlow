import mongoose from "mongoose";
const Schema = mongoose.Schema;

// raw Materials Counter schema
const rawMaterialscounterSchema = new Schema({
    seq: { type: Number, default: 0 }
});

const rawMaterialsCounter = mongoose.model("rawMaterialsCounter", rawMaterialscounterSchema);

const rawMaterialsSchema = new Schema({
    materialId: { 
        type: String, 
        required: false,
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
    inventoryName: { 
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
rawMaterialsSchema.pre("save", async function(next) {
    if (!this.isNew) return next();

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

export default mongoose.model("rawMaterialsModel", rawMaterialsSchema);
