import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  process: { type: String },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Prevent OverwriteModelError
export default mongoose.models.Subcategory ||
  mongoose.model("Subcategory", subcategorySchema);