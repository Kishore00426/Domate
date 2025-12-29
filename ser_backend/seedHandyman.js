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
        let handyman = await Category.findOne({ name: 'Handyman Services' });
        if (!handyman) {
            handyman = await Category.create({
                name: 'Handyman Services',
                description: 'Professional handyman services for all your home repair needs.',
                imageUrl: '/uploads/categories/handyman.jpg' // Placeholder path
            });
            console.log('Created Handyman Category');
        } else {
            console.log('Handyman Category exists');
            // Update description/image if missing
            if (!handyman.imageUrl) {
                handyman.imageUrl = '/uploads/categories/handyman.jpg';
                handyman.description = 'Professional handyman services for all your home repair needs.';
                await handyman.save();
            }
        }

        // 2. Create Subcategories
        const subs = [
            { name: 'Electrician', imageUrl: '/uploads/subcategories/electrician.jpg' },
            { name: 'Plumber', imageUrl: '/uploads/subcategories/plumber.jpg' },
            { name: 'Carpenter', imageUrl: '/uploads/subcategories/carpenter.jpg' }
        ];

        for (const s of subs) {
            let sub = await Subcategory.findOne({ name: s.name });
            if (!sub) {
                sub = await Subcategory.create({
                    name: s.name,
                    category: handyman._id,
                    imageUrl: s.imageUrl,
                    process: 'Standard service process'
                });
                console.log(`Created ${s.name} Subcategory`);
                // Link to Category
                await Category.findByIdAndUpdate(handyman._id, { $addToSet: { subcategories: sub._id } });
            } else {
                console.log(`${s.name} exists`);
                // Ensure linked
                if (sub.category?.toString() !== handyman._id.toString()) {
                    sub.category = handyman._id;
                    await sub.save();
                    await Category.findByIdAndUpdate(handyman._id, { $addToSet: { subcategories: sub._id } });
                    console.log(`Linked ${s.name} to Handyman`);
                }
                // Update image if missing
                if (!sub.imageUrl) {
                    sub.imageUrl = s.imageUrl;
                    await sub.save();
                }
            }
        }

        console.log('Seeding complete');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
