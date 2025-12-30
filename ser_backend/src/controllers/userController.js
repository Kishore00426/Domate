import User from "../models/User.js";
import Address from "../models/Address.js";

// Get user profile with address
export const getUserProfile = async (req, res) => {
  try {
    // Fetch user and address
    const user = await User.findById(req.user._id).populate("role");
    const address = await Address.findOne({ user: req.user._id });

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role ? user.role.name : null,
        address: address ? {
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country
        } : null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// Delete user account + address
export const deleteUser = async (req, res) => {
  try {
    // Delete the user
    await User.findByIdAndDelete(req.user._id);

    // Delete associated address (if any)
    await Address.deleteOne({ user: req.user._id });

    res.json({ success: true, message: "User and address deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Update user profile
export const updateUserProfileAndAddress = async (req, res) => {
  try {
    const { username, email, street, city, state, postalCode, country } = req.body;

    // Update user profile if provided
    let updatedUser = null;
    if (username || email) {
      const updateData = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;

      updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).populate("role");
    } else {
      updatedUser = await User.findById(req.user._id).populate("role");
    }

    // Upsert address if provided
    let updatedAddress = await Address.findOne({ user: req.user._id });
    if (street || city || state || postalCode || country) {
      if (updatedAddress) {
        Object.assign(updatedAddress, { street, city, state, postalCode, country });
        await updatedAddress.save();
      } else {
        updatedAddress = await Address.create({ user: req.user._id, street, city, state, postalCode, country });
      }
    }

    res.json({
      success: true,
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role ? updatedUser.role.name : null,
        address: updatedAddress
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};