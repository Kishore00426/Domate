import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "No token provided" });
    }

    const token = header.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, error: "Invalid or expired token" });
    }

    const user = await User.findById(decoded._id).populate("role");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    req.user = user; // attach user object to request
    next();
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
  console.log("Authenticated user:", req.user._id);
};
