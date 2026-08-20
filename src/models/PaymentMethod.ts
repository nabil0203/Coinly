import mongoose from 'mongoose';

const PaymentMethodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  balance: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Simple unique index — no user scoping needed for single-user app
PaymentMethodSchema.index({ name: 1 }, { unique: true });

export default mongoose.models.PaymentMethod || mongoose.model('PaymentMethod', PaymentMethodSchema);
