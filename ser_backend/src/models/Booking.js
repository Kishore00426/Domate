import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
 serviceProvider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending"
    },
    scheduledDate: { type: Date },
    notes: { type: String }
  },
  { timestamps: true }
);

// ✅ Safe export pattern (avoids OverwriteModelError)
export default mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema);