import mongoose from "mongoose";
import dotenv from "dotenv";
import Service from "./src/models/Service.js";
import Category from "./src/models/Category.js";
import Subcategory from "./src/models/Subcategory.js";

dotenv.config();

console.log("Connecting to DB...");
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Connected. Inspecting Image URLs...");

        const services = await Service.find({}, 'title imageUrl');
        console.log("\n--- Services ---");
        services.forEach(s => console.log(`${s.title}: "${s.imageUrl}"`));

        const categories = await Category.find({}, 'name imageUrl');
        console.log("\n--- Categories ---");
        categories.forEach(c => console.log(`${c.name}: "${c.imageUrl}"`));

        const subcategories = await Subcategory.find({}, 'name imageUrl');
        console.log("\n--- Subcategories ---");
        subcategories.forEach(s => console.log(`${s.name}: "${s.imageUrl}"`));

        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
