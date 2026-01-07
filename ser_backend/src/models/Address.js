import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  street: { type: String },
  city: { type: String },
  state: { type: String },
  postalCode: { type: String },
  country: { type: String },
  phone: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Safe export pattern
export default mongoose.models.Address ||
  mongoose.model("Address", addressSchema);