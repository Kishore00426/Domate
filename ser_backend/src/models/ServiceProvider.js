import mongoose from "mongoose";

// Emergency contact as a nested object
const emergencyContactSchema = new mongoose.Schema({
  name: { type: String },
  phone: { type: String },
  relation: { type: String }
}, { _id: false });

const serviceProviderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  phone: { type: String },
  address: { type: String },
  experience: { type: String }, // or Number if you prefer
  nativePlace: { type: String },
  currentPlace: { type: String },
  emergencyContact: emergencyContactSchema,

  // ✅ multiple services supported
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],

  certificates: [{ type: String }],   // multiple certificate file paths
  addressProofs: [{ type: String }],  // multiple address proof file paths
  idProofs: [{ type: String }],       // multiple ID proof file paths

  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.ServiceProvider ||
  mongoose.model("ServiceProvider", serviceProviderSchema);