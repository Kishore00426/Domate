import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
// Import routes
import authRoutes from "./routes/authRoutes.js"; 
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Health check route (optional)
app.get("/api/ping", (req, res) => {
  res.json({ success: true, message: "pong" });
});

// Connect to MongoDB Atlas and start server
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
    app.use("/uploads", express.static("uploads"));
    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/admin", adminRoutes);

    // Start server
    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  }
})();