import mongoose from "mongoose";

const privilegeSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true, trim: true },
    description: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("Privilege", privilegeSchema);