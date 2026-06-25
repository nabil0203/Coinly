import mongoose from 'mongoose';

const MandatoryExpenseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Expense name is required'],
    trim: true,
    maxlength: 200,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  default_payment_method: {
    type: String,
    default: '',
    trim: true,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const MandatoryExpense = mongoose.models.MandatoryExpense
  || mongoose.model('MandatoryExpense', MandatoryExpenseSchema);

export default MandatoryExpense;
