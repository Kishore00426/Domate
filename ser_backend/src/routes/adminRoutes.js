import express from "express";
import {
  createPrivilege,
  getPrivileges,
  getPrivilege,
  updatePrivilege,
  deletePrivilege
} from "../controllers/adminController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// Middleware: only allow admins
const requireAdmin = (req, res, next) => {
  if (req.user.role?.name !== "admin") {
    return res.status(403).json({ success: false, error: "Access denied. Admins only." });
  }
  next();
};

router.use(authenticate, requireAdmin);

// CRUD routes
router.post("/privileges", createPrivilege);
router.get("/privileges", getPrivileges);
router.get("/privileges/:id", getPrivilege);
router.put("/privileges/:id", updatePrivilege);
router.delete("/privileges/:id", deletePrivilege);

export default router;