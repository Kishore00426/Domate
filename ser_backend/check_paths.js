
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/domate');
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

    const services = await Service.find({}, 'title imageUrl');
    console.log('--- Services ---');
    services.forEach(s => console.log(`${s.title}: ${s.imageUrl}`));

    const categories = await Category.find({}, 'name imageUrl');
    console.log('\n--- Categories ---');
    categories.forEach(c => console.log(`${c.name}: ${c.imageUrl}`));

    const subcategories = await Subcategory.find({}, 'name imageUrl');
    console.log('\n--- Subcategories ---');
    subcategories.forEach(s => console.log(`${s.name}: ${s.imageUrl}`));

    mongoose.connection.close();
};

checkPaths();
