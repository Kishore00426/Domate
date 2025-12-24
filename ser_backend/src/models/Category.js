import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  subcategories: [
    {
      name: { type: String, required: true },
      description: { type: String }
    }
  ]
});

export default mongoose.model("Category", categorySchema);