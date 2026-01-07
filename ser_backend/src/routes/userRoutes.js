import express from "express";
import { authenticate } from "../middleware/Authenticate.js";
import { authorize } from "../middleware/Authorize.js";
import {
  getUserProfile,
  updateUserProfileAndAddress,
  deleteUser,
  getApprovedProviders,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  //getAllUsers
} from "../controllers/userController.js";

const router = express.Router();

// ---------------- LOGGED-IN USER ROUTES ----------------

// Get own profile
router.get("/profile", authenticate, getUserProfile);

// Update profile + address (combined)
router.put("/profile-address", authenticate, updateUserProfileAndAddress);

// ---------------- ADDRESS ROUTES ----------------
router.get("/addresses", authenticate, getUserAddresses);
router.post("/addresses", authenticate, addUserAddress);
router.put("/addresses/:id", authenticate, updateUserAddress);
router.delete("/addresses/:id", authenticate, deleteUserAddress);

// Delete own account
router.delete("/profile", authenticate, deleteUser);

// ---------------- APPROVED PROVIDERS (USER SIDE) ----------------
// Users can see only providers approved by admin
// Optional filters: ?serviceId=xxx or ?categoryId=yyy
router.get("/providers/approved", authenticate, authorize(["user"]), getApprovedProviders);

// ---------------- ADMIN-ONLY ROUTES ----------------
// Uncomment if you want admin to list all users
// router.get("/", authenticate, authorize(["admin", "super_admin"]), getAllUsers);

export default router;