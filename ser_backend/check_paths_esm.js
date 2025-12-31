
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
        console.log('Connecting to:', uri);
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

const checkPaths = async () => {
    await connectDB();

    const serviceCount = await Service.countDocuments();
    console.log(`\nFound ${serviceCount} services`);
    const services = await Service.find({}, 'title imageUrl');
    console.log('--- Services ---');
    services.forEach(s => console.log(`"${s.title}": "${s.imageUrl}"`));

    const categoryCount = await Category.countDocuments();
    console.log(`\nFound ${categoryCount} categories`);
    const categories = await Category.find({}, 'name imageUrl');
    console.log('--- Categories ---');
    categories.forEach(c => console.log(`"${c.name}": "${c.imageUrl}"`));

    const subcategoryCount = await Subcategory.countDocuments();
    console.log(`\nFound ${subcategoryCount} subcategories`);
    const subcategories = await Subcategory.find({}, 'name imageUrl');
    console.log('--- Subcategories ---');
    subcategories.forEach(s => console.log(`"${s.name}": "${s.imageUrl}"`));

    mongoose.connection.close();
};

checkPaths();
