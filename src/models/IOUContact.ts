import mongoose from 'mongoose';

const IOUContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
    default: null, // Set on first transaction to remember which section this contact belongs to
  },
}, {
  timestamps: true,
});

// Compound index to ensure uniqueness per user
IOUContactSchema.index({ name: 1, user: 1 }, { unique: true });

if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.IOUContact;
}

export default mongoose.models.IOUContact || mongoose.model('IOUContact', IOUContactSchema);
