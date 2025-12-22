import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true, trim: true },
    privileges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Privilege" }]
  },
  { timestamps: true }
);

export default mongoose.model("Role", roleSchema);