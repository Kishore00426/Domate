import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import {
  getUserProfile,
  updateUserProfileAndAddress,
  deleteUser,
  //getAllUsers
} from "../controllers/userController.js";

const router = express.Router();

// Logged-in user routes
router.get("/profile", authenticate, getUserProfile);

// Combined update: profile + address (works if user updates either one or both)
router.put("/profile-address", authenticate, updateUserProfileAndAddress);

// Delete own account
router.delete("/profile", authenticate, deleteUser);

// Admin-only route (admin + super_admin)
//router.get("/", authenticate, authorize(["admin", "super_admin"]), getAllUsers);

export default router;