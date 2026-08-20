import mongoose from 'mongoose';

const IOUContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  total_receivable: {
    type: Number,
    default: 0, // How much THEY owe the USER
    min: [0, 'Total receivable cannot be below 0'],
  },
  total_debt: {
    type: Number,
    default: 0, // How much the USER owes THEM
    min: [0, 'Total debt cannot be below 0'],
  },
  primary_type: {
    type: String,
    enum: ['receivable', 'debt'],
    default: null, // Set on first transaction — determines which section in /debts
  },
}, {
  timestamps: true,
});

// Simple unique name index — no user scoping needed for single-user app
IOUContactSchema.index({ name: 1 }, { unique: true });

export default mongoose.models.IOUContact || mongoose.model('IOUContact', IOUContactSchema);
