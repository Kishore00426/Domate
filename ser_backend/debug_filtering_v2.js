import mongoose from 'mongoose';
import Category from './src/models/Category.js';
import Subcategory from './src/models/Subcategory.js';
import Service from './src/models/Service.js';

const debug = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is missing');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        console.log('--- Checking Categories ---');
        const categories = await Category.find({});
        categories.forEach(c => {
            console.log(`Category: '${c.name}' (ID: ${c._id})`);
        });

        console.log('\n--- Checking "Tap Leakage Repair" Service (Should be Plumbing) ---');
        const tapService = await Service.findOne({ title: /Tap Leakage/i });
        if (tapService) {
            console.log(`Service: ${tapService.title}`);
            console.log(`Assigned Category ID: ${tapService.category}`);
            const cat = await Category.findById(tapService.category);
            console.log(`Resolved Category Name: '${cat ? cat.name : 'NOT FOUND'}'`);
        } else {
            console.log('Service "Tap Leakage Repair" not found.');
        }

        console.log('\n--- Checking "Cleaning" Category Lookup ---');
        const cleaningName = "Cleaning";
        const regex = new RegExp(`^${cleaningName}$`, "i");
        const cleaningCat = await Category.findOne({ name: { $regex: regex } });
        console.log(`Looking for '${cleaningName}' with regex... Found: ${cleaningCat ? cleaningCat.name : 'NULL'}`);

        console.log('\n--- Checking Service Filtering for Cleaning ---');
        if (cleaningCat) {
            const services = await Service.find({ category: cleaningCat._id });
            console.log(`Found ${services.length} services for category 'Cleaning'`);
            services.forEach(s => console.log(` - ${s.title}`));
        } else {
            console.log("Cleaning category not found, cannot check services.");
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

debug();
