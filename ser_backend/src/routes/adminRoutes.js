import express from "express";
import {
  // Privileges
  createPrivilege,
  getPrivileges,
  getPrivilege,
  updatePrivilege,
  deletePrivilege,

  // Roles
  assignPrivilegesToRole,
  getRolePrivileges,

  // Categories
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,

  // Subcategories (single image)
  createSubcategory,
  getSubcategories,
  updateSubcategory,
  deleteSubcategory,
  linkSubcategoryToCategory,

  // Services
  createService,
  getServices,
  getService,
  updateService,
  deleteService,

  // Users & Providers
  getUsers,
  deleteUser,
  getPendingProviders,
  verifyProvider,
  getDashboardStats
} from "../controllers/adminController.js";

import { authenticate } from "../middleware/Authenticate.js"; // Fixed casing
import { upload } from "../middleware/upload.js";

const router = express.Router();

// Middleware: only allow admins
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role?.name !== "admin") {
    return res.status(403).json({ success: false, error: "Access denied. Admins only." });
  }
  next();
};

router.use(authenticate, requireAdmin);

// ---------------- PRIVILEGE CRUD ----------------
router.post("/privileges", createPrivilege);
router.get("/privileges", getPrivileges);
router.get("/privileges/:id", getPrivilege);
router.put("/privileges/:id", updatePrivilege);
router.delete("/privileges/:id", deletePrivilege);

// ---------------- ROLE PRIVILEGE MANAGEMENT ----------------
router.put("/roles/privileges", assignPrivilegesToRole);
router.get("/roles/:roleName/privileges", getRolePrivileges);

// ---------------- CATEGORY CRUD ----------------
router.post("/categories", upload.single("image"), createCategory);
router.get("/categories", getCategories);
router.put("/categories/:id", upload.single("image"), updateCategory);
router.delete("/categories/:id", deleteCategory);

// ---------------- SUBCATEGORY CRUD (single image) ----------------
router.post("/subcategories", upload.single("image"), createSubcategory);
router.get("/subcategories", getSubcategories);
router.put("/subcategories/:id", upload.single("image"), updateSubcategory);
router.delete("/subcategories/:id", deleteSubcategory);

// Link subcategory to category
router.post("/categories/link-subcategory", linkSubcategoryToCategory);

// ---------------- SERVICE CRUD ----------------
router.post("/services", upload.single("image"), createService);
router.get("/services", getServices);
router.get("/services/:id", getService);
router.put("/services/:id", upload.single("image"), updateService);
router.delete("/services/:id", deleteService);

// ---------------- SERVICE PROVIDER MANAGEMENT (Admin only) ----------------
router.get("/providers/pending", getPendingProviders);
router.post("/providers/:id/verify", verifyProvider);

// ---------------- USER MANAGEMENT ----------------
router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);

// ---------------- DASHBOARD STATS ----------------
router.get("/stats", getDashboardStats);

export default router;