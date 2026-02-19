import User from "../models/User.js";
import Address from "../models/Address.js";
import ServiceProvider from "../models/ServiceProvider.js";
import Booking from "../models/Booking.js";

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("role");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const address = await Address.findOne({ user: req.user._id });

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        contactNumber: user.contactNumber,
        role: user.role ? user.role.name : null,
        address: address
          ? {
            street: address.street,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            phone: address.phone,
          }
          : null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    await Address.deleteOne({ user: req.user._id });

    res.json({ success: true, message: "User and address deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateUserProfileAndAddress = async (req, res) => {
  try {
    const { username, email, street, city, state, postalCode, country, phone } = req.body;

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (phone) updateData.contactNumber = phone;

    let updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
    }).populate("role");

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    let updatedAddress = await Address.findOne({ user: req.user._id });
    if (street || city || state || postalCode || country || phone) {
      if (updatedAddress) {
        Object.assign(updatedAddress, { street, city, state, postalCode, country, phone });
        await updatedAddress.save();
      } else {
        updatedAddress = await Address.create({
          user: req.user._id,
          street,
          city,
          state,
          postalCode,
          country,
          phone,
        });
      }
    }

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        contactNumber: updatedUser.contactNumber,
        role: updatedUser.role ? updatedUser.role.name : null,
        address: updatedAddress
          ? {
            street: updatedAddress.street,
            city: updatedAddress.city,
            state: updatedAddress.state,
            postalCode: updatedAddress.postalCode,
            country: updatedAddress.country,
            phone: updatedAddress.phone,
          }
          : null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getApprovedProviders = async (req, res) => {
  try {
    const { serviceId, categoryId } = req.query;

    const query = { approvalStatus: "approved" };
    if (serviceId) {
      query.services = serviceId; // filter by service
    }

    let providers = await ServiceProvider.find(query)
      .populate("user", "username email")
      .populate({
        path: "services",
        populate: { path: "category", select: "title" },
      });

    if (categoryId) {
      providers = providers.filter(provider =>
        provider.services.some(service => service.category?._id.toString() === categoryId)
      );
    }

    res.json({ success: true, providers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getUserAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id });
    res.json({ success: true, addresses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const addUserAddress = async (req, res) => {
  try {
    const { street, city, state, postalCode, country } = req.body;

    const newAddress = await Address.create({
      user: req.user._id,
      street,
      city,
      state,
      postalCode,
      country,
    });

    res.json({ success: true, address: newAddress });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateUserAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { street, city, state, postalCode, country } = req.body;

    const updatedAddress = await Address.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { street, city, state, postalCode, country },
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({ success: false, error: "Address not found" });
    }

    res.json({ success: true, address: updatedAddress });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteUserAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAddress = await Address.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!deletedAddress) {
      return res.status(404).json({ success: false, error: "Address not found" });
    }

    res.json({ success: true, message: "Address deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const Booking = (await import("../models/Booking.js")).default; // Dynamic import to avoid top-level if simpler to append
    // Actually, better to add top-level import. Let's do that in a separate step.
    // Re-writing to use standard import if I can edit top.
    // For now, let's just append the function body.

    // START FUNCTION BODY
    const bookings = await Booking.find({ user: req.user._id, status: 'completed' })
      .populate({
        path: 'service',
        populate: { path: 'category' } // Deep populate category
      });

    const spendingMap = {};
    const categoryMap = {};

    bookings.forEach(booking => {
      if (!booking.service) return;

      const serviceName = booking.service.title || 'Unknown Service';
      const categoryName = booking.service.category?.title || 'Other';
      const amount = booking.invoice?.totalAmount || 0;

      // 1. Spending per Service
      spendingMap[serviceName] = (spendingMap[serviceName] || 0) + amount;

      // 2. Usage per Category
      categoryMap[categoryName] = (categoryMap[categoryName] || 0) + 1;
    });

    const spendingData = Object.keys(spendingMap).map(key => ({
      name: key,
      value: spendingMap[key]
    }));

    const categoryData = Object.keys(categoryMap).map(key => ({
      name: key,
      value: categoryMap[key]
    }));

    res.json({
      success: true,
      stats: {
        spending: spendingData,
        categories: categoryData
      }
    });
  } catch (err) {
    console.error("Error in getUserStats:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};