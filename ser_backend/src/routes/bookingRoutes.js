// routes/bookingRoutes.js
import express from "express";
import { authenticate } from "../middleware/Authenticate.js";
import { authorize } from "../middleware/Authorize.js";
import {
  createBooking,
  updateBookingStatus,
  getUserBookings,
  getProviderBookings,
  getProviderContact
} from "../controllers/bookingController.js";

const router = express.Router();

// ---------------- USER ROUTES ----------------

// User creates a booking
router.post("/", authenticate, authorize(["user"]), createBooking);

// User views their bookings
router.get("/my", authenticate, authorize(["user"]), getUserBookings);

// User gets provider contact (only if booking accepted)
router.get("/:id/contact", authenticate, authorize(["user"]), getProviderContact);

// ---------------- PROVIDER ROUTES ----------------

// Provider views incoming bookings
router.get("/provider", authenticate, authorize(["service_provider"]), getProviderBookings);

// Provider updates booking status
router.put("/:id/status", authenticate, authorize(["service_provider"]), updateBookingStatus);

export default router;