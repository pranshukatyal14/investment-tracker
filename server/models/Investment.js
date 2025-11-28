import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  subcategory: { type: String },
  date: { type: Date, required: true },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model('Investment', investmentSchema);
