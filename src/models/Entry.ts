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

if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Entry;
}
const Entry = mongoose.models.Entry || mongoose.model('Entry', EntrySchema);
export default Entry;
