import express from "express";
import { authenticate } from "../middleware/Authenticate.js";
import { authorize } from "../middleware/Authorize.js";
import { upload } from "../middleware/upload.js";
import {
  upsertProviderDetails,
  getProviderByUser,
  getMyProviderProfile
} from "../controllers/serviceProviderController.js";

const router = express.Router();

// 👇 Provider fetches their own profile
router.get("/me", authenticate, authorize(["service_provider"]), getMyProviderProfile);

// 👇 Provider updates their own profile (details + file upload in one request)
router.put(
  "/me",
  authenticate,
  authorize(["service_provider"]),
  upload.fields([
    { name: "certificate", maxCount: 10 },   // multiple certificates
    { name: "addressProof", maxCount: 10 },  // multiple address proofs
    { name: "idProof", maxCount: 10 }        // multiple ID proofs
  ]),
  (req, res, next) => {
    // Force the ID to match the logged-in user
    req.params.id = req.user._id.toString();
    next();
  },
  upsertProviderDetails
);

// 👇 Provider submits or updates details + uploads files by ID (same PUT handles both)
router.put(
  "/:id",
  authenticate,
  authorize(["service_provider"]),
  upload.fields([
    { name: "certificate", maxCount: 10 },
    { name: "addressProof", maxCount: 10 },
    { name: "idProof", maxCount: 10 }
  ]),
  upsertProviderDetails
);

// 👇 Get provider details by userId (admin or self)
// Note: Admins can call this too, but approval/rejection is handled in adminRoutes
router.get("/:userId", authenticate, getProviderByUser);

export default router;