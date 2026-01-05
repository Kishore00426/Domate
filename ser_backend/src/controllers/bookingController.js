import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Service from "../models/Service.js";
import ServiceProvider from "../models/ServiceProvider.js";

// ---------------- USER CREATES BOOKING ----------------
export const createBooking = async (req, res) => {
  try {
    const { providerId, serviceId, scheduledDate, notes } = req.body;

    // 1. Ensure provider exists, has correct role, and is approved
    const provider = await User.findById(providerId).populate("role");
    if (
      !provider ||
      provider.role.name !== "service_provider" ||
      provider.providerStatus !== "approved"
    ) {
      return res.status(400).json({ success: false, error: "Provider not approved or not found" });
    }

    // 2. Ensure service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, error: "Service not found" });
    }

    // 3. Ensure provider is linked to this service via ServiceProvider collection
    const link = await ServiceProvider.findOne({
      user: providerId,
      services: serviceId,
      approvalStatus: "approved"
    });
    if (!link) {
      return res.status(400).json({ success: false, error: "Provider not linked to this service" });
    }

    // 4. Create booking
    const booking = await Booking.create({
      user: req.user._id,
      serviceProvider: providerId,
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

    const booking = await Booking.findById(req.params.id).populate("serviceProvider user");
    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    if (booking.serviceProvider._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    booking.status = status;
    await booking.save();

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- USER VIEWS THEIR BOOKINGS ----------------
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("serviceProvider", "username email phone")
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
      .populate("user", "username email")
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