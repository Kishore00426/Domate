import Booking from "../models/Booking.js";
import Privilege from "../models/Privilege.js";
import Role from "../models/Role.js";
import Service from "../models/Service.js";
import Category from "../models/Category.js";
import Subcategory from "../models/Subcategory.js";
import User from "../models/User.js";
import ServiceProvider from "../models/ServiceProvider.js";

// ---------------- PRIVILEGE CRUD ----------------
export const createPrivilege = async (req, res) => {
  try {
    const { name, description } = req.body;
    const privilege = await Privilege.create({ name, description });
    res.status(201).json({ success: true, privilege });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getPrivileges = async (req, res) => {
  try {
    const privileges = await Privilege.find();
    res.json({ success: true, privileges });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getPrivilege = async (req, res) => {
  try {
    const privilege = await Privilege.findById(req.params.id);
    if (!privilege) return res.status(404).json({ success: false, error: "Privilege not found" });
    res.json({ success: true, privilege });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updatePrivilege = async (req, res) => {
  try {
    const privilege = await Privilege.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!privilege) return res.status(404).json({ success: false, error: "Privilege not found" });
    res.json({ success: true, privilege });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deletePrivilege = async (req, res) => {
  try {
    const privilege = await Privilege.findByIdAndDelete(req.params.id);
    if (!privilege) return res.status(404).json({ success: false, error: "Privilege not found" });
    res.json({ success: true, message: "Privilege deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- ROLE PRIVILEGE MANAGEMENT ----------------
export const assignPrivilegesToRole = async (req, res) => {
  try {
    const { roleName, privilegeIds } = req.body;
    const role = await Role.findOne({ name: roleName });
    if (!role) return res.status(404).json({ success: false, error: "Role not found" });

    const privileges = await Privilege.find({ _id: { $in: privilegeIds } });
    if (privileges.length !== privilegeIds.length) {
      return res.status(400).json({ success: false, error: "One or more privileges not found" });
    }

    role.privileges = privilegeIds;
    await role.save();

    res.json({ success: true, message: `Privileges updated for role ${roleName}`, role });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getRolePrivileges = async (req, res) => {
  try {
    const role = await Role.findOne({ name: req.params.roleName }).populate("privileges");
    if (!role) return res.status(404).json({ success: false, error: "Role not found" });
    res.json({ success: true, role: role.name, privileges: role.privileges });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- USER MANAGEMENT ----------------
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().populate("role");
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all pending providers (admin use)
export const getPendingProviders = async (req, res) => {
  try {
    // Fetch providers with approvalStatus = 'pending'
    let providers = await ServiceProvider.find({ approvalStatus: "pending" })
      .populate({
        path: "user",
        select: "username email role providerStatus contactNumber",
        populate: { path: "role", select: "name" }
      })
      .populate({
        path: "services",
        populate: { path: "category", select: "name" }
      });

    //  Manually populate Address city for location display
    const providersWithAddress = await Promise.all(providers.map(async (provider) => {
      const pObj = provider.toObject();
      if (provider.user?._id) {
        const address = await import("../models/Address.js").then(({ default: Address }) =>
          Address.findOne({ user: provider.user._id })
        );
        pObj.location = address ? address.city : "N/A";
        // Also ensure phone fallback if needed (though we rely on contactNumber)
        pObj.phone = provider.user.contactNumber || "N/A";
      }
      return pObj;
    }));

    res.json({ success: true, providers: providersWithAddress });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin approves or rejects a provider
export const verifyProvider = async (req, res) => {
  try {
    const { action } = req.body; // "approve" or "reject"

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ success: false, error: "Invalid action" });
    }

    const status = action === "approve" ? "approved" : "rejected";

    // 1. Find the Service Provider document first
    const serviceProvider = await ServiceProvider.findById(req.params.id).populate("user");
    if (!serviceProvider) {
      return res.status(404).json({ success: false, error: "Service provider application not found" });
    }

    const user = serviceProvider.user;
    if (!user) {
      return res.status(404).json({ success: false, error: "Linked user account not found" });
    }

    // 2. Update User status
    user.providerStatus = status;
    await user.save();

    // 3. Update ServiceProvider status
    serviceProvider.approvalStatus = status;
    await serviceProvider.save();

    res.json({
      success: true,
      message: `Provider ${status}`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role?.name,
        providerStatus: user.providerStatus
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- CATEGORY CRUD ----------------
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const imageUrl = req.file ? `/uploads/categories/${req.file.filename}` : null;
    const category = await Category.create({ name, description, imageUrl });
    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("subcategories");
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) {
      updates.imageUrl = `/uploads/categories/${req.file.filename}`;
    } else if (req.body.removeImage === 'true') {
      updates.imageUrl = null;
    }
    const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!category) return res.status(404).json({ success: false, error: "Category not found" });
    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, error: "Category not found" });
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- SUBCATEGORY CRUD (single image) ----------------
export const createSubcategory = async (req, res) => {
  try {
    const { name, process, category, description } = req.body;
    const imageUrl = req.file ? `/uploads/subcategories/${req.file.filename}` : null;

    // Create subcategory with parent reference
    const subcategory = await Subcategory.create({
      name,
      process,
      description,
      imageUrl,
      category: category || null
    });

    // If parent category is specified, add this subcategory to it
    if (category) {
      await Category.findByIdAndUpdate(
        category,
        { $addToSet: { subcategories: subcategory._id } }
      );
    }

    res.status(201).json({ success: true, subcategory });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.find();
    res.json({ success: true, subcategories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateSubcategory = async (req, res) => {
  try {
    const { name, process, category, description } = req.body;
    const updates = { name, process, description };
    if (req.file) {
      updates.imageUrl = `/uploads/subcategories/${req.file.filename}`;
    } else if (req.body.removeImage === 'true') {
      updates.imageUrl = null;
    }

    // Retrieve current subcategory to check for parent change
    const currentSub = await Subcategory.findById(req.params.id);
    if (!currentSub) return res.status(404).json({ success: false, error: "Subcategory not found" });

    // Handle Parent Category Change
    if (category && currentSub.category && currentSub.category.toString() !== category) {
      // Remove from old parent
      await Category.findByIdAndUpdate(currentSub.category, { $pull: { subcategories: currentSub._id } });
      // Add to new parent
      await Category.findByIdAndUpdate(category, { $addToSet: { subcategories: currentSub._id } });
      updates.category = category;
    } else if (category && !currentSub.category) {
      // Add to new parent
      await Category.findByIdAndUpdate(category, { $addToSet: { subcategories: currentSub._id } });
      updates.category = category;
    }

    const subcategory = await Subcategory.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, subcategory });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findByIdAndDelete(req.params.id);
    if (!subcategory) return res.status(404).json({ success: false, error: "Subcategory not found" });
    res.json({ success: true, message: "Subcategory deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Link subcategory to category
export const linkSubcategoryToCategory = async (req, res) => {
  try {
    const { categoryId, subcategoryIds } = req.body; // expect array
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ success: false, error: "Category not found" });

    // Add only new subcategories
    subcategoryIds.forEach(id => {
      if (!category.subcategories.includes(id)) {
        category.subcategories.push(id);
      }
    });

    await category.save();
    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- SERVICE CRUD ----------------
// Helper to separate comma strings into array
const parseArrayField = (field) => {
  if (typeof field === "string") {
    return field.split(",").map((item) => item.trim()).filter((item) => item !== "");
  }
  if (Array.isArray(field)) {
    // Handle case where array contains comma-separated strings
    return field
      .flatMap(item => (typeof item === "string" ? item.split(",") : [item]))
      .map(item => (typeof item === "string" ? item.trim() : item))
      .filter(item => item !== "");
  }
  return [];
};

// ---------------- SERVICE CRUD ----------------
export const createService = async (req, res) => {
  try {
    const {
      title, detailedDescription, price,
      whatIsCovered, whatIsNotCovered,
      requiredEquipment, serviceProcess, // changed neededEquipment to requiredEquipment to match Schema
      warranty,
      commissionRate, // New field
      category, subcategory
    } = req.body;
    const imageUrl = req.file ? `/uploads/services/${req.file.filename}` : null;

    const service = await Service.create({
      title,
      detailedDescription,
      price,
      whatIsCovered: parseArrayField(whatIsCovered),
      whatIsNotCovered: parseArrayField(whatIsNotCovered),
      requiredEquipment: parseArrayField(requiredEquipment), // matched schema name
      serviceProcess: parseArrayField(serviceProcess),
      serviceProcess: parseArrayField(serviceProcess),
      warranty,
      commissionRate: commissionRate || 0,
      category,
      subcategory,
      imageUrl
    });
    res.status(201).json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getServices = async (req, res) => {
  try {
    const services = await Service.find()
      .populate("category")
      .populate("subcategory");
    res.json({ success: true, services });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate("category")
      .populate("subcategory");
    if (!service) return res.status(404).json({ success: false, error: "Service not found" });
    res.json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) {
      updates.imageUrl = `/uploads/services/${req.file.filename}`;
    } else if (req.body.removeImage === 'true') {
      updates.imageUrl = null;
    }

    // Parse array fields if they exist in updates
    if (updates.whatIsCovered) updates.whatIsCovered = parseArrayField(updates.whatIsCovered);
    if (updates.whatIsNotCovered) updates.whatIsNotCovered = parseArrayField(updates.whatIsNotCovered);
    if (updates.requiredEquipment) updates.requiredEquipment = parseArrayField(updates.requiredEquipment);
    if (updates.serviceProcess) updates.serviceProcess = parseArrayField(updates.serviceProcess);

    // Ensure commissionRate is updated if provided
    if (updates.commissionRate !== undefined) updates.commissionRate = Number(updates.commissionRate);

    const service = await Service.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate("category")
      .populate("subcategory");
    if (!service) return res.status(404).json({ success: false, error: "Service not found" });
    res.json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, error: "Service not found" });
    res.json({ success: true, message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- BOOKING MANAGEMENT ----------------
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "username email contactNumber")
      .populate("serviceProvider", "username email contactNumber")
      .populate({
        path: "service",
        select: "title price category",
        populate: { path: "category", select: "name" }
      })
      .sort({ createdAt: -1 }); // Newest first

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- DASHBOARD STATS ----------------
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeProviders = await User.countDocuments({ providerStatus: "approved" });
    const pendingVerifications = await User.countDocuments({ providerStatus: "pending" });
    const totalServices = await Service.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = 0; // Placeholder

    res.json({
      success: true,
      data: {
        totalUsers,
        activeProviders,
        pendingVerifications,
        totalServices,
        totalBookings,
        totalRevenue
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- REPORTS ----------------
export const getUserReport = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Aggregate stats for this provider
    const bookings = await Booking.find({
      serviceProvider: userId,
      status: { $in: ["completed", "work_completed"] }
    });

    const totalBookings = bookings.length;

    // Calculate total earned from invoice.totalAmount
    const totalEarned = bookings.reduce((sum, booking) => {
      return sum + (booking.invoice?.totalAmount || 0);
    }, 0);

    // Get recent activity (last 5 bookings)
    const recentActivity = await Booking.find({ serviceProvider: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("service", "title")
      .populate("user", "username");

    res.json({
      success: true,
      data: {
        userId,
        username: user.username,
        totalBookings,
        totalEarned,
        recentActivity
      }
    });
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ success: false, error: "Failed to generate report" });
  }
};

export const getReportAnalytics = async (req, res) => {
  try {
    const { type, startDate, endDate, targetId } = req.query;

    const query = {
      status: { $in: ["completed", "work_completed"] }
    };

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let reportData = {};

    if (type === 'service_commission') {
      if (targetId) query.service = targetId;

      const bookings = await Booking.find(query)
        .populate('service', 'title price')
        .populate('serviceProvider', 'username');

      const totalCommission = bookings.reduce((sum, b) => sum + (b.commission || 0), 0);

      reportData = {
        title: "Service Commission Report",
        totalCommission,
        bookings: bookings.map(b => ({
          id: b._id,
          serviceName: b.service?.title,
          providerName: b.serviceProvider?.username,
          commission: b.commission || 0,
          date: b.createdAt
        }))
      };
    } else if (type === 'provider') {
      if (targetId) query.serviceProvider = targetId;

      const bookings = await Booking.find(query)
        .populate('service', 'title')
        .populate('user', 'username');

      const totalEarned = bookings.reduce((sum, b) => sum + (b.invoice?.totalAmount || 0), 0);
      const totalCommission = bookings.reduce((sum, b) => sum + (b.commission || 0), 0);

      reportData = {
        title: "Provider Performance Report",
        totalEarned,
        totalCommission, // Admin view of how much commission generated from this provider
        bookings: bookings.map(b => ({
          id: b._id,
          serviceName: b.service?.title,
          customerName: b.user?.username,
          amount: b.invoice?.totalAmount || 0,
          commission: b.commission || 0,
          date: b.createdAt
        }))
      };

    } else if (type === 'total') {
      const bookings = await Booking.find(query)
        .populate('service', 'title');

      const totalRevenue = bookings.reduce((sum, b) => sum + (b.invoice?.totalAmount || 0), 0);
      const totalCommission = bookings.reduce((sum, b) => sum + (b.commission || 0), 0);
      const totalBookings = bookings.length;

      reportData = {
        title: "Total System Report",
        totalRevenue,
        totalCommission,
        totalBookings,
        bookings: bookings.map(b => ({
          id: b._id,
          serviceName: b.service?.title, // Optional: might be too much data for total report, but useful for PDF list
          amount: b.invoice?.totalAmount || 0,
          commission: b.commission || 0,
          date: b.createdAt
        }))
      };
    }

    res.json({ success: true, data: reportData });

  } catch (err) {
    console.error("Error generating analytics report:", err);
    res.status(500).json({ success: false, error: "Failed to generate analytics report" });
  }
};
