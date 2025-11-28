import mongoose from 'mongoose';

const categoryAllocationSchema = new mongoose.Schema({
  categoryName: { type: String, required: true },
  allocatedAmount: { type: Number, required: true },
  carryOver: { type: Number, default: 0 }
});

const budgetSchema = new mongoose.Schema({
  month: { type: String, required: true, unique: true },
  totalAmount: { type: Number, required: true },
  categoryAllocations: [categoryAllocationSchema],
  totalCarryOver: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Budget', budgetSchema);
