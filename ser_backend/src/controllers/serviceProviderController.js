import ServiceProvider from "../models/ServiceProvider.js";
import Address from "../models/Address.js";
import User from "../models/User.js"; // ✅ Import User for phone updates

// ... existing code ...

/**
 * Delete a specific document from provider profile
 * query: ?type=certificate|addressProof|idProof&filePath=...
 */
export const deleteProviderDocument = async (req, res) => {
  try {
    const { type, filePath } = req.body; // Expecting body or query? using body for safety
    if (!['certificates', 'addressProofs', 'idProofs'].includes(type)) {
      return res.status(400).json({ success: false, error: "Invalid document type" });
    }

    // Logic to remove from array
    const update = {};
    update[type] = filePath;

    const provider = await ServiceProvider.findOneAndUpdate(
      { user: req.user._id },
      { $pull: update },
      { new: true }
    );

    // Optional: Delete file from disk using fs.unlink if needed (skipping for now to avoid complexity with paths)

    res.json({ success: true, provider });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Update provider bio details + certificates/proofs
 * (phone, address, experience, nativePlace, currentPlace, emergencyContact, documents)
 */
export const updateProviderBio = async (req, res) => {
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

    // ✅ Save address to Address collection
    if (req.body.address) {
      await Address.findOneAndUpdate(
        { user: req.user._id },
        { street: req.body.address }, // mapping single string address to street
        { upsert: true, new: true }
      );
    }

    // ✅ Update User contactNumber if phone is provided
    if (req.body.phone) {
      await User.findByIdAndUpdate(req.user._id, { contactNumber: req.body.phone });
    }

    const updateData = {
      // phone: req.body.phone, // Removed from ServiceProvider
      // address: req.body.address, // Removed from ServiceProvider
      experience: req.body.experience,
      nativePlace: req.body.nativePlace,
      currentPlace: req.body.currentPlace,
      consultFee: req.body.consultFee, // ✅ Save/Update consult fee
      emergencyContact,
      certificates: certificateFiles.map(file => `/uploads/providers/${file.filename}`),
      addressProofs: addressProofFiles.map(file => `/uploads/providers/${file.filename}`),
      idProofs: idProofFiles.map(file => `/uploads/providers/${file.filename}`),
    };

    // ✅ Only trigger "pending" verification if DOCUMENTS are updated
    if (certificateFiles.length > 0 || addressProofFiles.length > 0 || idProofFiles.length > 0) {
      updateData.approvalStatus = "pending";
    }

    const provider = await ServiceProvider.findOneAndUpdate(
      { user: req.user._id },
      updateData,
      { upsert: true, new: true }
    );

    // Attach address for frontend consistency
    const addressDoc = await Address.findOne({ user: req.user._id });
    const providerObj = provider.toObject();
    providerObj.address = addressDoc ? addressDoc.street : "";

    res.json({ success: true, provider: providerObj });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Update provider services + descriptions
 * (services array of ObjectIds, serviceDescriptions array of { serviceId, description })
 */
export const updateProviderServices = async (req, res) => {
  try {
    const { id } = req.params;

    // Ownership + role checks
    if (req.user._id.toString() !== id) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }
    const userRole = req.user.role?.name || req.user.role;
    if (userRole !== "service_provider") {
      return res.status(403).json({ success: false, error: "User is not a service provider" });
    }

    // ✅ Handle catalog services (single or multiple)
    let services = req.body.services;
    if (services) {
      if (typeof services === "string") {
        try {
          services = JSON.parse(services); // Try parsing JSON array string
        } catch {
          services = services.split(",").map(s => s.trim()); // Fallback: comma-separated string
        }
      }
      if (!Array.isArray(services)) {
        services = [services];
      }
    } else {
      services = [];
    }

    // ✅ Handle serviceDescriptions (array of { serviceId, description })
    let serviceDescriptions = req.body.serviceDescriptions;
    if (serviceDescriptions) {
      if (typeof serviceDescriptions === "string") {
        try {
          serviceDescriptions = JSON.parse(serviceDescriptions);
        } catch {
          return res.status(400).json({ success: false, error: "Invalid serviceDescriptions JSON format" });
        }
      }
      if (!Array.isArray(serviceDescriptions)) {
        serviceDescriptions = [serviceDescriptions];
      }
    } else {
      serviceDescriptions = [];
    }

    const updateData = {
      services,
      serviceDescriptions,
      approvalStatus: "pending" // always pending until admin verifies
    };

    const provider = await ServiceProvider.findOneAndUpdate(
      { user: req.user._id },
      updateData,
      { upsert: true, new: true }
    ).populate("services");

    res.json({ success: true, provider });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get provider details by userId (admin or self)
 */
export const getProviderByUser = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ user: req.params.userId })
      .populate("user services");
    if (!provider) {
      return res.status(404).json({ success: false, error: "Provider not found" });
    }

    // Attach address for frontend consistency
    const addressDoc = await Address.findOne({ user: req.params.userId });
    const providerObj = provider.toObject();
    providerObj.address = addressDoc ? addressDoc.street : "";

    res.json({ success: true, provider: providerObj });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get provider profile by ID (for admin or public view)
 */
export const getProviderProfile = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ user: req.params.id }).populate('services').populate('user', 'username email contactNumber'); // ✅ Populating contactNumber
    if (!provider) return res.status(404).json({ success: false, error: "Provider not found" });
    res.json({ success: true, provider });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get logged-in provider’s own profile
 */
export const getMyProviderProfile = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ user: req.user._id }).populate('services').populate('user', 'username email contactNumber'); // ✅ Populating contactNumber
    if (!provider) return res.status(404).json({ success: false, error: "Provider profile not found" });
    res.json({ success: true, provider });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get approved providers by Service ID
 * Public access
 */
export const getProvidersByService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Find custom providers who have this service in their list AND are approved
    // Populate user to get name, profile image (if any)
    const providers = await ServiceProvider.find({
      services: serviceId,
      approvalStatus: "approved"
    })
      .populate("user", "username email location experience documents date_joined") // Populate specific user fields
      .select("rating totalReviews experience user services price_range"); // Select specific provider fields

    res.json({ success: true, providers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get all verified providers sorted by experience
 * Public access
 */
export const getAllVerifiedProviders = async (req, res) => {
  try {
    const providers = await ServiceProvider.find({ approvalStatus: "approved" })
      .populate("user", "username email location profileImage") // Ensure profileImage is populated if it exists
      .populate("services", "title")
      .sort({ experience: -1 }); // Sort by experience descending

    res.json({ success: true, providers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};