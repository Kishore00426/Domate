import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// Register (defaults to "user", but can accept "service_provider")
router.post("/register", register);

// Login (works for both user and service provider)
router.post("/login", login);

// Get logged-in user
router.get("/me", authenticate, getMe);

export default router;