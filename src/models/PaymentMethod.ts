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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

PaymentMethodSchema.index({ name: 1, user: 1 }, { unique: true });

export default mongoose.models.PaymentMethod || mongoose.model('PaymentMethod', PaymentMethodSchema);
