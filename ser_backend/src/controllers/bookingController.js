import Booking from "../models/Booking.js";
import Role from "../models/Role.js";
import Address from "../models/Address.js";
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

// ---------------- GET USER BOOKINGS ----------------
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("serviceProvider", "username email contactNumber")
      .populate({
        path: "service",
        select: "title price category",
        populate: { path: "category", select: "name" }
      });

    // Enhance bookings with phone from ServiceProvider (Fallback if User.contactNumber is empty)
    const bookingsWithPhone = await Promise.all(bookings.map(async (b) => {
      const bookingObj = b.toObject();
      if (bookingObj.serviceProvider) {
        try {
          const provider = await ServiceProvider.findOne({ user: bookingObj.serviceProvider._id });
          bookingObj.serviceProvider.phone = provider?.phone || null;
          bookingObj.serviceProvider.consultFee = provider?.consultFee || 0;
        } catch (e) {
          bookingObj.serviceProvider.phone = null;
        }
      }
      return bookingObj;
    }));

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- GET PROVIDER BOOKINGS ----------------
export const getProviderBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ serviceProvider: req.user._id })
      .populate("user", "username email contactNumber")
      .populate({
        path: "service",
        select: "title price category",
        populate: { path: "category", select: "name" }
      });

    // Enhance bookings with phone from Address (Fallback)
    const bookingsWithPhone = await Promise.all(bookings.map(async (b) => {
      const bookingObj = b.toObject();
      if (bookingObj.user) {
        try {
          const address = await Address.findOne({ user: bookingObj.user._id });
          bookingObj.user.phone = address?.phone || null;
        } catch (e) {
          bookingObj.user.phone = null;
        }
      }
      return bookingObj;
    }));

    res.json({ success: true, bookings: bookingsWithPhone });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- GET PROVIDER CONTACT ----------------
export const getProviderContact = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ _id: id, user: req.user._id })
      .populate("serviceProvider", "username email contactNumber");

    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    if (booking.status !== "accepted") {
      return res.json({ success: false, message: "Booking not accepted yet" });
    }

    const provider = await ServiceProvider.findOne({ user: booking.serviceProvider._id });

    res.json({
      success: true,
      contact: {
        username: booking.serviceProvider.username,
        email: booking.serviceProvider.email,
        phone: booking.serviceProvider.contactNumber || provider?.phone || "Not available"
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- DELETE BOOKING ----------------
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ _id: id, user: req.user._id });

    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    // Allow delete pending, cancelled, rejected, or accepted
    if (!["pending", "cancelled", "rejected", "accepted"].includes(booking.status)) {
      return res.status(400).json({ success: false, error: "Cannot delete active booking" });
    }

    await Booking.deleteOne({ _id: id });
    res.json({ success: true, message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- PROVIDER UPDATES BOOKING STATUS ----------------
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Allow more statuses: 'accepted', 'rejected', 'in_progress', 'arrived'
    if (!["accepted", "rejected", "in_progress", "arrived"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }

    const booking = await Booking.findById(req.params.id);
    // ... existing code ...
    if (booking.serviceProvider.toString() !== req.user._id.toString()) {
      // ... existing code ...
    }

    booking.status = status;
    await booking.save();

    // Populate for frontend update
    await booking.populate("user", "username email");
    await booking.populate("service", "title");

    return res.json({ success: true, booking });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
// ...

// ---------------- PROVIDER MARKS JOB AS DONE ----------------
export const completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { servicePrice, serviceCharge } = req.body;

    if (!servicePrice || serviceCharge === undefined) {
      return res.status(400).json({ success: false, error: "Please provide service price and charge" });
    }

    const booking = await Booking.findOne({ _id: id, serviceProvider: req.user._id });
    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found or access denied" });
    }

    // Allow completion from 'accepted', 'arrived', or 'in_progress'
    if (!["accepted", "arrived", "in_progress"].includes(booking.status)) {
      return res.status(400).json({ success: false, error: "Booking must be in progress or accepted before completion" });
    }

    booking.status = "work_completed"; // Intermediate status
    // booking.completedAt = new Date(); // User confirms completion now

    const price = Number(servicePrice);
    const charge = Number(serviceCharge);
    const gst = (price + charge) * 0.18; // 18% GST
    const total = price + charge + gst;

    booking.invoice = {
      servicePrice: price,
      serviceCharge: charge,
      gst: parseFloat(gst.toFixed(2)),
      totalAmount: parseFloat(total.toFixed(2))
    };

    await booking.save();

    // Populate for frontend update
    await booking.populate("user", "username email");
    await booking.populate("service", "title");
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- USER CONFIRMS COMPLETION ----------------
export const confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOne({ _id: id, user: req.user._id });
    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found or access denied" });
    }

    if (booking.status !== "work_completed") {
      return res.status(400).json({ success: false, error: "Provider must mark job as done first" });
    }

    booking.status = "completed";
    booking.completedAt = new Date();
    await booking.save();

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- USER RATES BOOKING ----------------
export const rateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({ success: false, error: "Rating is required" });
    }

    const booking = await Booking.findOne({ _id: id, user: req.user._id });
    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found or access denied" });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({ success: false, error: "Can only rate completed bookings" });
    }

    booking.review = {
      rating: Number(rating),
      comment: comment || "",
      createdAt: new Date()
    };

    booking.status = "completed"; // Re-affirming status
    await booking.save();

    // Populate for frontend update
    await booking.populate("serviceProvider", "username email");
    await booking.populate("service", "title");

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};