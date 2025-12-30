import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './src/models/Category.js';
import Subcategory from './src/models/Subcategory.js';

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Create or Find Handyman Services Category
        // Trim and case-insensitive check
        let handyman = await Category.findOne({ name: { $regex: /^Handyman Services$/i } });

        if (!handyman) {
            console.log('Handyman Category NOT found. Creating...');
            handyman = await Category.create({
                name: 'Handyman Services',
                description: 'Professional handyman services for all your home repair needs.',
                imageUrl: '/uploads/categories/handyman.jpg'
            });
            console.log('Created Handyman Category:', handyman._id);
        } else {
            console.log('Handyman Category EXISTS:', handyman._id);
            // Verify Exact Name
            if (handyman.name !== 'Handyman Services') {
                console.log(`Updating name from '${handyman.name}' to 'Handyman Services'`);
                handyman.name = 'Handyman Services';
                await handyman.save();
            }
        }

        // 2. Create Subcategories
        const subs = [
            {
                name: 'Electrician',
                imageUrl: '/uploads/subcategories/electrician.jpg',
                description: 'Expert electrical services for repairs, installations, and safety inspections.'
            },
            {
                name: 'Plumber',
                imageUrl: '/uploads/subcategories/plumber.jpg',
                description: 'Reliable plumbing solutions for leaks, clogs, and bathroom fittings.'
            },
            {
                name: 'Carpenter',
                imageUrl: '/uploads/subcategories/carpenter.jpg',
                description: 'Skilled carpentry for furniture, repairs, and custom woodwork.'
            }
        ];

        for (const s of subs) {
            let sub = await Subcategory.findOne({ name: s.name });
            if (!sub) {
                sub = await Subcategory.create({
                    name: s.name,
                    category: handyman._id,
                    imageUrl: s.imageUrl,
                    process: 'Standard service process',
                    description: s.description
                });
                console.log(`Created ${s.name} Subcategory`);
                await Category.findByIdAndUpdate(handyman._id, { $addToSet: { subcategories: sub._id } });
            } else {
                console.log(`${s.name} exists`);
                let needsSave = false;
                if (sub.category?.toString() !== handyman._id.toString()) {
                    sub.category = handyman._id;
                    await Category.findByIdAndUpdate(handyman._id, { $addToSet: { subcategories: sub._id } });
                    console.log(`Linked ${s.name} to Handyman`);
                    needsSave = true;
                }
                if (!sub.description) {
                    sub.description = s.description;
                    needsSave = true;
                    console.log(`Added description to ${s.name}`);
                }
                if (needsSave) await sub.save();
            }
        }

        // Verification List
        console.log('\n--- VERIFICATION: All Categories ---');
        const allCats = await Category.find({});
        allCats.forEach(c => console.log(`- '${c.name}' (ID: ${c._id})`));

        console.log('Seeding procedure complete.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
