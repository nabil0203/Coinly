import mongoose from 'mongoose';

const PaymentMethodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    unique: true,
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

export default mongoose.models.PaymentMethod || mongoose.model('PaymentMethod', PaymentMethodSchema);
