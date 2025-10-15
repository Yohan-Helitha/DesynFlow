import mongoose from 'mongoose';
const { Schema } = mongoose;

const FinanceNotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  eventType: { 
    type: String, 
    enum: [
      'payment_submitted',
      'payment_approved',
      'payment_rejected',
      'payment_pending',
      'payment_receipt_uploaded',
      'expense_added',
      'expense_modified',
      'expense_exceeds_budget',
      'estimation_submitted',
      'estimation_approved',
      'estimation_rejected',
      'budget_threshold_exceeded',
      'quotation_created',
      'quotation_approved',
      'quotation_rejected',
      'purchase_order_submitted',
      'purchase_order_approved',
      'purchase_order_rejected',
      'report_generated'
    ],
    required: true,
    index: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedEntity: {
    entityType: { type: String, enum: ['Payment', 'Expense', 'Estimation', 'Quotation', 'PurchaseOrder', 'Report'] },
    entityId: { type: Schema.Types.ObjectId }
  },
  metadata: { type: Schema.Types.Mixed }, // Additional contextual data
  isRead: { type: Boolean, default: false, index: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  readAt: { type: Date }
}, { timestamps: true });

// Index for efficient querying of unread notifications
FinanceNotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model('FinanceNotification', FinanceNotificationSchema);
