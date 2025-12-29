import express from "express";
import { getAllServices, getAllCategories, getServiceById, getCategoryDetails } from "../controllers/serviceController.js";

const router = express.Router();

router.get("/", getAllServices);
router.get("/categories", getAllCategories);
router.get("/categories/:name", getCategoryDetails);
router.get("/:id", getServiceById);

export default router;
