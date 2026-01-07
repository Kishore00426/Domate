import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Category from './src/models/Category.js';
import Subcategory from './src/models/Subcategory.js';
import Service from './src/models/Service.js';

const seedCleaning = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        // 1. Find or Create 'Cleaning' Category
        let cleaningCat = await Category.findOne({ name: 'Cleaning' });
        if (!cleaningCat) {
            console.log("Creating 'Cleaning' category...");
            cleaningCat = await Category.create({
                name: 'Cleaning',
                description: 'Professional home cleaning services',
                imageUrl: 'https://images.unsplash.com/photo-1581578731117-104f8a7469d0?q=80&w=2070'
            });
        }
        console.log("Cleaning Category ID:", cleaningCat._id);

        // 2. Create Subcategories
        const subs = [
            { name: 'Home Deep Cleaning', img: 'https://images.unsplash.com/photo-1527515673516-75c44e03c537?q=80&w=2070' },
            { name: 'Bathroom Cleaning', img: 'https://images.unsplash.com/photo-1584622024886-dac281fd7526?q=80&w=2070' },
            { name: 'Kitchen Cleaning', img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2070' },
            { name: 'Sofa & Carpet Cleaning', img: 'https://images.unsplash.com/photo-1581578731117-104f8a7469d0?q=80&w=2070' }
        ];

        for (const sub of subs) {
            let subDoc = await Subcategory.findOne({ name: sub.name, category: cleaningCat._id });
            if (!subDoc) {
                console.log(`Creating subcategory: ${sub.name}`);
                subDoc = await Subcategory.create({
                    name: sub.name,
                    category: cleaningCat._id,
                    description: `Professional ${sub.name}`,
                    imageUrl: sub.img,
                    process: ["Inspection", "Cleaning", "Sanitization"]
                });

                // Link to Category
                if (!cleaningCat.subcategories.includes(subDoc._id)) {
                    cleaningCat.subcategories.push(subDoc._id);
                    await cleaningCat.save();
                }

                // 3. Create Service for this subcategory
                const serviceTitle = `${sub.name} Service`;
                const existingService = await Service.findOne({ title: serviceTitle });
                if (!existingService) {
                    console.log(`Creating service: ${serviceTitle}`);
                    await Service.create({
                        title: serviceTitle,
                        category: cleaningCat._id,
                        subcategory: subDoc._id,
                        description: `Top-notch ${sub.name}`,
                        detailedDescription: `Full ${sub.name} package including all equipment and eco-friendly chemicals.`,
                        price: 499 + Math.floor(Math.random() * 500),
                        imageUrl: sub.img,
                        whatIsCovered: ["Dusting", "Scrubbing", "Mopping"],
                        whatIsNotCovered: ["Heavy lifting"],
                        requiredEquipment: ["Vacuum cleaner", "Mops"],
                        serviceProcess: ["Arrive", "Inspect", "Clean", "Leave"]
                    });
                }
            }
        }

        console.log("Seeding complete!");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

seedCleaning();
