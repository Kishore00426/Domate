// routes/bookingRoutes.js
import express from "express";
import { authenticate } from "../middleware/Authenticate.js"; // Fixed casing
import { authorize } from "../middleware/Authorize.js";
import {
  createBooking,
  updateBookingStatus,
  getUserBookings,
  getProviderBookings,
  getProviderContact,
  deleteBooking,
  completeBooking,
  confirmBooking, // ✅ Import new controller
  rateBooking
} from "../controllers/bookingController.js";

const router = express.Router();

// ---------------- USER ROUTES ----------------

// User creates a booking (linked to provider’s User ID)
router.post(
  "/",
  authenticate,
  authorize(["user"]),
  createBooking
);

// User views their own bookings
router.get(
  "/my",
  authenticate,
  authorize(["user"]),
  getUserBookings
);

// User gets provider contact (only if booking accepted)
router.get(
  "/:id/contact",
  authenticate,
  authorize(["user"]),
  getProviderContact
);

// User deletes a booking
router.delete(
  "/:id",
  authenticate,
  authorize(["user"]),
  deleteBooking
);

// ---------------- PROVIDER ROUTES ----------------

// Provider views incoming bookings (bookings tied to their User ID)
router.get(
  "/provider",
  authenticate,
  authorize(["service_provider"]),
  getProviderBookings
);

// Provider updates booking status (accepted/rejected)
router.put(
  "/:id/status",
  authenticate,
  authorize(["service_provider"]),
  updateBookingStatus
);

// Provider marks booking as completed (with invoice)
router.post(
  "/:id/complete",
  authenticate,
  authorize(["service_provider"]),
  completeBooking
);

// User rates a completed booking
router.post(
  "/:id/rate",
  authenticate,
  authorize(["user"]),
  rateBooking
);

// User confirms completion
router.put(
  "/:id/confirm",
  authenticate,
  authorize(["user"]),
  confirmBooking
);

export default router;