import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Adjust path to .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Category from './src/models/Category.js';
import Service from './src/models/Service.js';

const checkCleaning = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // 1. Check if 'Cleaning' category exists
        // Regex search to be safe
        const categories = await Category.find({ name: { $regex: /Cleaning/i } });
        console.log("Categories found matching 'Cleaning':", categories.map(c => ({ id: c._id, name: c.name })));

        if (categories.length === 0) {
            console.log("❌ No 'Cleaning' category found!");
            process.exit();
        }

        // 2. Check if there are services linked to these categories
        for (const cat of categories) {
            const services = await Service.find({ category: cat._id });
            console.log(`Services under '${cat.name}':`, services.length);
            services.forEach(s => console.log(` - [${s._id}] ${s.title}`));
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

checkCleaning();
