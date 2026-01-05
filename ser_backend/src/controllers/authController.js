import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Role from "../models/Role.js";
import fs from "fs";
import path from "path";

// Register (works for both user and service provider)
export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const roleDoc = await Role.findOne({ name: role || "user" });
    if (!roleDoc) {
      return res.status(400).json({ success: false, error: "Role not found" });
    }

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: roleDoc._id
    });

    res.status(201).json({
      success: true,
      message: `Registered successfully as ${roleDoc.name}`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: roleDoc.name
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Login (works for both user and service provider)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and populate role
    const user = await User.findOne({ email }).populate("role");
    if (!user) {
      return res.status(400).json({ success: false, error: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Invalid credentials" });
    }

    // ✅ Token only contains user ID
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Return token + user info (including role name for client convenience)
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role?.name || null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// Get logged-in user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("role");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role?.name || null // Safely access role name
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};