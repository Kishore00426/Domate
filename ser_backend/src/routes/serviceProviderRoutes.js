import express from "express";
import { authenticate } from "../middleware/Authenticate.js";
import { authorize } from "../middleware/Authorize.js";
import { upload } from "../middleware/upload.js";
import {
  updateProviderBio,
  updateProviderServices,
  getProviderByUser,
  getMyProviderProfile
} from "../controllers/serviceProviderController.js";

const router = express.Router();

// 👇 Provider fetches their own profile
router.get(
  "/me",
  authenticate,
  authorize(["service_provider"]),
  getMyProviderProfile
);

// 👇 Provider updates their bio + certificates/proofs
router.put(
  "/me/bio",
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
  updateProviderBio
);

// 👇 Provider updates their services + descriptions
router.put(
  "/me/services",
  authenticate,
  authorize(["service_provider"]),
  (req, res, next) => {
    // Force the ID to match the logged-in user
    req.params.id = req.user._id.toString();
    next();
  },
  updateProviderServices
);

// 👇 Admin or provider fetches provider details by userId
// Note: Admins can call this too, but approval/rejection is handled in adminRoutes
router.get(
  "/:userId",
  authenticate,
  authorize(["admin", "service_provider"]),
  getProviderByUser
);

export default router;