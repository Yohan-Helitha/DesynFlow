import mongoose from "mongoose";
const Schema = mongoose.Schema;

// inventory locations Counter schema
const invlocationscounterSchema = new Schema({
    seq: { type: Number, default: 0 }
});

const invLocationsCounter = mongoose.model("invLocationsCounter", invlocationscounterSchema);

const invLocationsSchema = new Schema({
    inventoryId: { 
        type: String, 
        unique: true 
    },
    inventoryName: { 
        type: String,
        required: true 
    },
    inventoryAddress: { 
        type: String, 
        required: true 
    },
    country: {
        type: String, 
        required: true 
    },
    capacity: {
        type: Number, 
        required: true
    },
    inventoryContact: {
        type: String,
        required: true,
        trim: true,  // removes extra spaces at start/end
        match: [/^\+?\d{1,3}?[-.\s]?\d{7,10}$/]
    },
    warehouseManagerName: {
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Pre-save hook to auto-fill fields
invLocationsSchema.pre("save", async function(next) {
    if (!this.isNew) return next();

    // ---- Auto-generate materialId (MP001, MP002...) ----
    let invloccounter = await invLocationsCounter.findOne();
    if (!invloccounter) {
        invloccounter = new invLocationsCounter({ seq: 0 });
        await invloccounter.save();
    }

    invloccounter.seq += 1;
    await invloccounter.save();

    const seqNum = invloccounter.seq.toString().padStart(3, "0"); // 001, 002, ...
    this.inventoryId = `IN${seqNum}`;

    next();
});

export default mongoose.model("invLocationsModel", invLocationsSchema);
