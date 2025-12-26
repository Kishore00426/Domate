import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", default: null },
    // Provider specific fields
    phone: { type: String },
    location: { type: String },
    category: { type: String },
    experience: { type: Number },
    providerStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'none'],
      default: 'none'
    },
    documents: [{ type: String }] // URLs to documents
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);