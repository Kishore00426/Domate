import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import path from "path";
import cors from "cors";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import serviceProviderRoutes from "./routes/serviceProviderRoutes.js";



const app = express();



// ...

// Middleware
app.use(cors());
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
    // Use absolute path for uploads to avoid CWD issues
    app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/services", serviceRoutes);
    app.use("/api/service-providers", serviceProviderRoutes);

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