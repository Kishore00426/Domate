import Service from "../models/Service.js";
import Category from "../models/Category.js";
import Subcategory from "../models/Subcategory.js";

// Get all services (public)
export const getAllServices = async (req, res) => {
    try {
        const { category, categoryId, subcategory } = req.query;
        let query = {};

        if (categoryId) {
            query.category = categoryId;
        } else if (category) {
            // Find category by name (case-insensitive)
            const catObj = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, "i") } });
            if (catObj) {
                query.category = catObj._id;
            } else {
                // Category not found
                return res.json({ success: true, services: [] });
            }
        }

        if (subcategory) {
            const subObj = await Subcategory.findOne({ name: { $regex: new RegExp(`^${subcategory}$`, "i") } });
            if (subObj) {
                query.subcategory = subObj._id;
            } else {
                return res.json({ success: true, services: [] });
            }
        }

        const services = await Service.find(query)
            .populate("category", "name")
            .populate("subcategory", "name");

        res.json({ success: true, services });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get all categories (public)
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json({ success: true, categories });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get single service
export const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate("category", "name")
            .populate("subcategory", "name");

        if (!service) {
            return res.status(404).json({ success: false, error: "Service not found" });
        }

        res.json({ success: true, service });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get category details by name (including subcategories)
export const getCategoryDetails = async (req, res) => {
    try {
        const { name } = req.params;
        // Case insensitive search
        const category = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } })
            .populate("subcategories");

        if (!category) {
            return res.status(404).json({ success: false, error: "Category not found" });
        }

        res.json({ success: true, category });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
