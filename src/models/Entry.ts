import mongoose from 'mongoose';

const EntrySchema = new mongoose.Schema({
  date: {
    type: String, // String formatted as YYYY-MM-DD for easier ledger grouping
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
    type: String, // Using name for now, but could be ObjectId
    required: true,
  },
  is_iou: {
    type: Boolean,
    default: false,
  },
  iou_details: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IOUTransaction',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes for common query patterns
EntrySchema.index({ user: 1, date: 1 });  // Monthly ledger view
EntrySchema.index({ user: 1, type: 1 });  // Aggregation by type

const Entry = mongoose.models.Entry || mongoose.model('Entry', EntrySchema);
export default Entry;
