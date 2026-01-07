import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Service from "../models/Service.js";
import ServiceProvider from "../models/ServiceProvider.js";
import mongoose from "mongoose";

// ---------------- USER CREATES BOOKING ----------------
export const createBooking = async (req, res) => {
  try {
    const { providerId, serviceId, scheduledDate, notes } = req.body;

    // 1. Load ServiceProvider document and linked User
    const spDoc = await ServiceProvider.findById(providerId).populate({
      path: "user",
      populate: { path: "role", select: "name" }
    });
    if (!spDoc || spDoc.approvalStatus !== "approved") {
      return res.status(400).json({ success: false, error: "Provider not approved or not found" });
    }

    // 2. Validate linked user has correct role and status
    const providerUser = spDoc.user;
    if (!providerUser) {
      return res.status(400).json({ success: false, error: "Linked user account not found" });
    }

    // 3. Ensure service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, error: "Service not found" });
    }

    // 4. Ensure provider offers this service
    if (!spDoc.services.map(s => s.toString()).includes(serviceId.toString())) {
      return res.status(400).json({ success: false, error: "Provider not linked to this service" });
    }

    // 5. Create booking with provider’s User ID
    const booking = await Booking.create({
      user: req.user._id,                // customer making the booking
      serviceProvider: providerUser._id, // ✅ store User ID
      service: serviceId,
      scheduledDate,
      notes
    });

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- PROVIDER UPDATES BOOKING STATUS ----------------
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    const rawUserId = req.user?._id ?? req.user?.id;
    if (!rawUserId) {
      return res.status(401).json({ success: false, error: "Not authenticated: user id missing" });
    }

    const authUserId = mongoose.Types.ObjectId.isValid(rawUserId)
      ? new mongoose.Types.ObjectId(rawUserId)
      : null;

    if (!authUserId) {
      return res.status(400).json({ success: false, error: "Invalid authenticated user id" });
    }

    // ✅ Authorization check
    if (!booking.serviceProvider.equals(authUserId)) {
      console.log('❌ AUTH MISMATCH! Booking Provider:', booking.serviceProvider, 'Auth User:', authUserId);
      return res.status(403).json({
        success: false,
        error: `Access denied: cannot modify another provider. Booking belongs to ${booking.serviceProvider}, you are ${authUserId}`
      });
    }

    booking.status = status;
    await booking.save();

    return res.json({ success: true, booking });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- USER VIEWS THEIR BOOKINGS ----------------
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("serviceProvider", "username email phone") // provider’s User info
      .populate("service", "title");

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- PROVIDER VIEWS INCOMING BOOKINGS ----------------
export const getProviderBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ serviceProvider: req.user._id })
      .populate("user", "username email phone")   // customer info
      .populate("service", "title");

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- USER GETS PROVIDER CONTACT (ONLY IF ACCEPTED) ----------------
export const getProviderContact = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("serviceProvider", "username email phone");

    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    if (booking.status !== "accepted") {
      return res.json({ success: false, message: "Booking not accepted yet" });
    }

    res.json({
      success: true,
      providerContact: {
        username: booking.serviceProvider.username,
        email: booking.serviceProvider.email,
        phone: booking.serviceProvider.phone || "N/A"
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};