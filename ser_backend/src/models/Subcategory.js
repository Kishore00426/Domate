import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  process: { type: String },
  imageUrl: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  createdAt: { type: Date, default: Date.now }
});

// Prevent OverwriteModelError
export default mongoose.models.Subcategory ||
  mongoose.model("Subcategory", subcategorySchema);