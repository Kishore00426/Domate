import User from "../models/User.js";
import Address from "../models/Address.js";
import ServiceProvider from "../models/ServiceProvider.js";

// ---------------- GET USER PROFILE ----------------
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
        role: user.role ? user.role.name : null,
        address: address
          ? {
              street: address.street,
              city: address.city,
              state: address.state,
              postalCode: address.postalCode,
              country: address.country,
            }
          : null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- DELETE USER ----------------
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

// ---------------- UPDATE USER PROFILE + ADDRESS ----------------
export const updateUserProfileAndAddress = async (req, res) => {
  try {
    const { username, email, street, city, state, postalCode, country } = req.body;

    // ✅ Update user profile
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    let updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
    }).populate("role");

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // ✅ Upsert address
    let updatedAddress = await Address.findOne({ user: req.user._id });
    if (street || city || state || postalCode || country) {
      if (updatedAddress) {
        Object.assign(updatedAddress, { street, city, state, postalCode, country });
        await updatedAddress.save();
      } else {
        updatedAddress = await Address.create({
          user: req.user._id,
          street,
          city,
          state,
          postalCode,
          country,
        });
      }
    }

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role ? updatedUser.role.name : null,
        address: updatedAddress
          ? {
              street: updatedAddress.street,
              city: updatedAddress.city,
              state: updatedAddress.state,
              postalCode: updatedAddress.postalCode,
              country: updatedAddress.country,
            }
          : null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- GET APPROVED PROVIDERS ----------------
// Users can see only providers approved by admin
// Optional filters: serviceId or categoryId
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

    // ✅ If categoryId filter is applied, filter providers whose services belong to that category
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