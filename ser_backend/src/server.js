import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import path from "path";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import serviceProviderRoutes from "./routes/serviceProviderRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";



const app = express();





app.use(cors());
app.use(express.json());

// Health check route (optional)
app.get("/api/ping", (req, res) => {
  res.json({ success: true, message: "pong" });
});

import fs from "fs";

// ... imports remain the same

// Connect to MongoDB Atlas and start server
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // 🛠️ IMAGE RECOVERY: Check 'general' folder if file is missing in specific folder
    // This fixes 404s for images uploaded before the folder logic fix
    app.get("/uploads/:folder/:filename", (req, res, next) => {
      const { folder, filename } = req.params;
      if (["services", "categories", "subcategories", "providers"].includes(folder)) {
        const paramspath = path.join(process.cwd(), "uploads", folder, filename);
        if (!fs.existsSync(paramspath)) {
          const generalPath = path.join(process.cwd(), "uploads/general", filename);
          if (fs.existsSync(generalPath)) {
            return res.sendFile(generalPath);
          }
        }
      }
      next();
    });

    app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
    app.use("/api/auth", authRoutes);
    app.use("/api/user", userRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/services", serviceRoutes);
    app.use("/api/providers", serviceProviderRoutes);
    app.use("/api/bookings", bookingRoutes);

    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  }
})();