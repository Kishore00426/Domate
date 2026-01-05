import mongoose from "mongoose";

// Emergency contact as a nested object
const emergencyContactSchema = new mongoose.Schema({
  name: { type: String },
  phone: { type: String },
  relation: { type: String }
}, { _id: false });

// Service description schema (hybrid: catalog service + provider-specific description)
const serviceDescriptionSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
  description: { type: String, trim: true }
}, { _id: false });

const serviceProviderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  phone: { type: String },
  address: { type: String },
  experience: { type: String }, // or Number if you prefer
  nativePlace: { type: String },
  currentPlace: { type: String },
  emergencyContact: emergencyContactSchema,

  // ✅ multiple services supported (linked to Service model)
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: false
  }],

  // ✅ hybrid: provider-specific descriptions for catalog services
  serviceDescriptions: [serviceDescriptionSchema],

  // ✅ file uploads as arrays
  certificates: [{ type: String }],
  addressProofs: [{ type: String }],
  idProofs: [{ type: String }],

  // ✅ approval workflow
  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  // ✅ Ratings
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.ServiceProvider ||
  mongoose.model("ServiceProvider", serviceProviderSchema);