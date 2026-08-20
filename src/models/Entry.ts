import mongoose from 'mongoose';

const IOUSubSchema = new mongoose.Schema({
  contact_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IOUContact',
    required: true,
  },
  iou_type: {
    type: String,
    enum: ['debt', 'receivable'],
    required: true,
  },
  iou_action: {
    type: String,
    enum: ['create', 'repay'],
    required: true,
  },
  details: {
    type: String,
    default: '',
  },
}, { _id: false });

const EntrySchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD for easy string comparison
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative'],
  },
  type: {
    type: String,
    enum: ['expense', 'cashin'],
    required: true,
  },
  payment_method: {
    type: String,
    required: true,
  },
  // Inline IOU data — no separate collection needed for single-user app
  iou: {
    type: IOUSubSchema,
    default: null,
  },
}, {
  timestamps: true,
});

// Only indexes we actually need for single-user queries
EntrySchema.index({ date: 1 });                         // Monthly ledger view
EntrySchema.index({ 'iou.contact_id': 1 });             // Contact history lookup

const Entry = mongoose.models.Entry || mongoose.model('Entry', EntrySchema);
export default Entry;
