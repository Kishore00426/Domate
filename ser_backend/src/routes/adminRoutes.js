import express from "express";
import {
  createPrivilege,
  getPrivileges,
  getPrivilege,
  updatePrivilege,
  deletePrivilege,
  assignPrivilegesToRole,
  getRolePrivileges,createService,updateService,getService,getServices,deleteService
} from "../controllers/adminController.js";
import { authenticate } from "../middleware/authenticate.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// Middleware: only allow admins
const requireAdmin = (req, res, next) => {
  if (req.user.role?.name !== "admin") {
    return res.status(403).json({ success: false, error: "Access denied. Admins only." });
  }
  next();
};

router.use(authenticate, requireAdmin);

// Privilege CRUD
router.post("/privileges", createPrivilege);
router.get("/privileges", getPrivileges);
router.get("/privileges/:id", getPrivilege);
router.put("/privileges/:id", updatePrivilege);
router.delete("/privileges/:id", deletePrivilege);

// Role privilege management
router.put("/roles/privileges", assignPrivilegesToRole);
router.get("/roles/:roleName/privileges", getRolePrivileges);

// Service CRUD
router.post("/services", upload.single("image"), createService);
router.get("/services", getServices);
router.get("/services/:id", getService);
router.put("/services/:id", upload.single("image"), updateService);
router.delete("/services/:id", deleteService);
export default router;