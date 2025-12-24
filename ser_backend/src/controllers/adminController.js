import Privilege from "../models/Privilege.js";
import Role from "../models/Role.js";
import Service from "../models/Service.js";
import Category from "../models/Category.js";
import Subcategory from "../models/Subcategory.js";

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
    if (req.file) updates.imageUrl = `/uploads/categories/${req.file.filename}`;
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
    const { name, process } = req.body;
    const imageUrl = req.file ? `/uploads/subcategories/${req.file.filename}` : null;
    const subcategory = await Subcategory.create({ name, process, imageUrl });
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
    const updates = { ...req.body };
    if (req.file) updates.imageUrl = `/uploads/subcategories/${req.file.filename}`;
    const subcategory = await Subcategory.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!subcategory) return res.status(404).json({ success: false, error: "Subcategory not found" });
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
    const { categoryId, subcategoryId } = req.body;
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ success: false, error: "Category not found" });
    if (!category.subcategories.includes(subcategoryId)) {
      category.subcategories.push(subcategoryId);
      await category.save();
    }
    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- SERVICE CRUD ----------------
export const createService = async (req, res) => {
  try {
    const {
      title, detailedDescription, price,
      whatIsCovered, whatIsNotCovered,
      neededEquipment, warranty,
      category, subcategory
    } = req.body;
    const imageUrl = req.file ? `/uploads/services/${req.file.filename}` : null;

    const service = await Service.create({
      title, detailedDescription, price,
      whatIsCovered, whatIsNotCovered,
      neededEquipment, warranty,
      category, subcategory,
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
    }
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