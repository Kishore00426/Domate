import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  detailedDescription: { type: String },
  price: { type: Number, required: true },
  whatIsCovered: { type: String },
  whatIsNotCovered: { type: String },
  neededEquipment: { type: String },
  warranty: { type: String },
  imageUrl: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" }
}, { timestamps: true });

export default mongoose.models.Service ||
  mongoose.model("Service", serviceSchema);