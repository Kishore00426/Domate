import mongoose from "mongoose";

const privilegeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String }
}, { timestamps: true });

export default mongoose.models.Privilege ||
  mongoose.model("Privilege", privilegeSchema);