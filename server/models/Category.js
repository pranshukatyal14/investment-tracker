import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  parentCategoryId: { type: String, required: true }
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, required: true },
  subcategories: [subcategorySchema]
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
