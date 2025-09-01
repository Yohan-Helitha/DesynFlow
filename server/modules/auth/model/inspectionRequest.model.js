import mangoose, { mongo } from 'mongoose';

const inspectionRequestSchema = new mongoose.Schema({
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        auto: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    propertyDetails: {
        type: String,
        required: true
    },
    inspectionDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'canceled'],
        default: 'pending'
    },
    paymentReceiptUrl: {
        type: String,
        required: false
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('InspectionRequest', inspectionRequestSchema);