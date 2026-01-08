import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    serviceProvider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "in_progress", "arrived", "work_completed", "completed", "cancelled"],
      default: "pending"
    },
    scheduledDate: { type: Date },
    notes: { type: String },

    // Invoice Details (Provider fills this)
    invoice: {
      servicePrice: { type: Number },
      serviceCharge: { type: Number },
      totalAmount: { type: Number }
    },

    // Review Details (User fills this)
    review: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      createdAt: { type: Date, default: Date.now }
    },

    completedAt: { type: Date }
  },
  { timestamps: true }
);

// ✅ Safe export pattern (avoids OverwriteModelError)
export default mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema);