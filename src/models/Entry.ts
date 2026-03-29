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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Entry || mongoose.model('Entry', EntrySchema);
