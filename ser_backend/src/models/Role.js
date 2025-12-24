import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  privileges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Privilege" }]
}, { timestamps: true });

export default mongoose.models.Role ||
  mongoose.model("Role", roleSchema);