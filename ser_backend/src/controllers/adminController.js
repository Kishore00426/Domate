import Privilege from "../models/Privilege.js";

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
    const privilege = await Privilege.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
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