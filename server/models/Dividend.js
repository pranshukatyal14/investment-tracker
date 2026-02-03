import mongoose from 'mongoose';

const dividendSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  company: { type: String, required: true },
  stockSymbol: { type: String, required: true },
  date: { type: Date, required: true },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model('Dividend', dividendSchema);
