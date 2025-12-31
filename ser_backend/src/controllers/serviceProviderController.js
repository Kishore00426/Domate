import ServiceProvider from "../models/ServiceProvider.js";

// Create or update provider details + handle PDF uploads
export const upsertProviderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Parse emergencyContact if sent as string
    let emergencyContact = req.body.emergencyContact;
    if (emergencyContact && typeof emergencyContact === "string") {
      try {
        emergencyContact = JSON.parse(emergencyContact);
      } catch {
        return res.status(400).json({ success: false, error: "Invalid emergencyContact JSON format" });
      }
    }

    // Ownership + role checks
    if (req.user._id.toString() !== id) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }
    const userRole = req.user.role?.name || req.user.role;
    if (userRole !== "service_provider") {
      return res.status(403).json({ success: false, error: "User is not a service provider" });
    }

    // ✅ Handle multiple files
    const certificateFiles = req.files?.certificate || [];
    const addressProofFiles = req.files?.addressProof || [];
    const idProofFiles = req.files?.idProof || [];

    // ✅ Handle services (single or multiple)
    let services = req.body.services;
    if (services) {
      if (typeof services === "string") {
        try {
          // Try parsing JSON array string
          services = JSON.parse(services);
        } catch {
          // Fallback: comma-separated string
          services = services.split(",").map(s => s.trim());
        }
      }
      if (!Array.isArray(services)) {
        services = [services];
      }
    } else {
      services = [];
    }

    const updateData = {
      phone: req.body.phone,
      address: req.body.address,
      experience: req.body.experience,
      nativePlace: req.body.nativePlace,
      currentPlace: req.body.currentPlace,
      emergencyContact,
      services, // ✅ always an array now
      certificates: certificateFiles.map(file => file.path),
      addressProofs: addressProofFiles.map(file => file.path),
      idProofs: idProofFiles.map(file => file.path),
      approvalStatus: "pending" // always pending until admin verifies
    };

    const provider = await ServiceProvider.findOneAndUpdate(
      { user: req.user._id },
      updateData,
      { upsert: true, new: true }
    );

    res.json({ success: true, provider });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get provider details by userId (admin or self)
export const getProviderByUser = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ user: req.params.userId })
      .populate("user services");
    if (!provider) {
      return res.status(404).json({ success: false, error: "Provider not found" });
    }
    res.json({ success: true, provider });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get logged-in provider’s own profile
export const getMyProviderProfile = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ user: req.user._id })
      .populate("user services");
    if (!provider) {
      return res.status(404).json({ success: false, error: "Provider profile not found" });
    }
    res.json({ success: true, provider });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};