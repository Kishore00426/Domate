import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './src/models/Category.js';

dotenv.config();

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const allCats = await Category.find({});
        console.log('--- All Categories ---');
        allCats.forEach(c => {
            console.log(`Name: '${c.name}', ID: ${c._id}`);
            // Print char codes to detect hidden chars
            const codes = [];
            for (let i = 0; i < c.name.length; i++) {
                codes.push(c.name.charCodeAt(i));
            }
            console.log(`   CharCodes: ${codes.join(', ')}`);
        });

        // Specific finding attempt
        const cat = await Category.findOne({ name: 'Handyman Services' });
        console.log('--- Search Result ---');
        console.log("Find 'Handyman Services':", cat ? 'FOUND' : 'NOT FOUND');

        // Case insensitive regex attempt
        const regexCat = await Category.findOne({ name: { $regex: new RegExp(`^Handyman Services$`, "i") } });
        console.log("Regex 'Handyman Services':", regexCat ? 'FOUND' : 'NOT FOUND');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
