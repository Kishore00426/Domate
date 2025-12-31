
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/domate';
        await mongoose.connect(uri);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const serviceSchema = new mongoose.Schema({}, { strict: false });
const Service = mongoose.model('Service', serviceSchema);

const categorySchema = new mongoose.Schema({}, { strict: false });
const Category = mongoose.model('Category', categorySchema);

const subcategorySchema = new mongoose.Schema({}, { strict: false });
const Subcategory = mongoose.model('Subcategory', subcategorySchema);

const placeholderImages = [
    'https://images.unsplash.com/photo-1581578731117-104f8a7469d0?q=80&w=2070', // Cleaning/Gen
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2070', // Sofa/Home
    'https://images.unsplash.com/photo-1584622024886-dac281fd7526?q=80&w=2070', // Bathroom
    'https://images.unsplash.com/photo-1527515673516-75c44e03c537?q=80&w=2070', // Office
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069', // Electrician
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=2070', // Plumbing
];

const getRandomImage = () => placeholderImages[Math.floor(Math.random() * placeholderImages.length)];

const updateImages = async () => {
    await connectDB();

    console.log('Updating Categories...');
    const categories = await Category.find({});
    for (const cat of categories) {
        // Only update if it looks like a local path that might be missing, or just update all for consistency
        // Let's update all to ensure they work.
        cat.imageUrl = getRandomImage();
        await cat.save();
        console.log(`Updated Category: ${cat.name}`);
    }

    console.log('\nUpdating Subcategories...');
    const subcategories = await Subcategory.find({});
    for (const sub of subcategories) {
        sub.imageUrl = getRandomImage();
        await sub.save();
        console.log(`Updated Subcategory: ${sub.name}`);
    }

    console.log('\nUpdating Services...');
    const services = await Service.find({});
    for (const s of services) {
        s.imageUrl = getRandomImage();
        await s.save();
        console.log(`Updated Service: ${s.title}`);
    }

    console.log('\nAll images updated to external placeholders.');
    mongoose.connection.close();
};

updateImages();
