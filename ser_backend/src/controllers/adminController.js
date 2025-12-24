import Privilege from "../models/Privilege.js";
import Role from "../models/Role.js";
import Service from "../models/Service.js";

// ---------------- PRIVILEGE CRUD ----------------

// Create privilege
export const createPrivilege = async (req, res) => {
  try {
    const { name, description } = req.body;
    const privilege = await Privilege.create({ name, description });
    res.status(201).json({ success: true, privilege });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all privileges
export const getPrivileges = async (req, res) => {
  try {
    const privileges = await Privilege.find();
    res.json({ success: true, privileges });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get single privilege
export const getPrivilege = async (req, res) => {
  try {
    const privilege = await Privilege.findById(req.params.id);
    if (!privilege) return res.status(404).json({ success: false, error: "Privilege not found" });
    res.json({ success: true, privilege });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update privilege
export const updatePrivilege = async (req, res) => {
  try {
    const privilege = await Privilege.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!privilege) return res.status(404).json({ success: false, error: "Privilege not found" });
    res.json({ success: true, privilege });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete privilege
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

// Assign privileges to a role
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

// Get privileges for a role
export const getRolePrivileges = async (req, res) => {
  try {
    const role = await Role.findOne({ name: req.params.roleName }).populate("privileges");
    if (!role) return res.status(404).json({ success: false, error: "Role not found" });

    res.json({ success: true, role: role.name, privileges: role.privileges });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- SERVICE CRUD ----------------

// Create service (with optional image)
export const createService = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const imageUrl = req.file ? `/uploads/services/${req.file.filename}` : null;

    const service = await Service.create({ name, description, price, imageUrl });
    res.status(201).json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all services
export const getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json({ success: true, services });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get single service
export const getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, error: "Service not found" });
    res.json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update service (with optional new image)
export const updateService = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) {
      updates.imageUrl = `/uploads/services/${req.file.filename}`;
    }

    const service = await Service.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!service) return res.status(404).json({ success: false, error: "Service not found" });

    res.json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete service
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, error: "Service not found" });
    res.json({ success: true, message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};