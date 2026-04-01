import mongoose from 'mongoose';

const IOUTransactionSchema = new mongoose.Schema({
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IOUContact',
    required: true,
  },
  entry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entry',
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
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  details: {
    type: String,
  },
}, {
  timestamps: true,
});

if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.IOUTransaction;
}
const IOUTransaction = mongoose.models.IOUTransaction || mongoose.model('IOUTransaction', IOUTransactionSchema);
export default IOUTransaction;
