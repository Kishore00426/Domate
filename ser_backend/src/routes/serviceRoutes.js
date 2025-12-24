import express from "express";
import { getAllServices, getAllCategories, getServiceById } from "../controllers/serviceController.js";

const router = express.Router();

router.get("/", getAllServices);
router.get("/categories", getAllCategories);
router.get("/:id", getServiceById);

export default router;
