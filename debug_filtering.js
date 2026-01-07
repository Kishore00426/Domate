const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'ser_backend', '.env') });

// Models (assuming paths)
const ServiceSchema = new mongoose.Schema({}, { strict: false });
const CategorySchema = new mongoose.Schema({}, { strict: false });
const Service = mongoose.model('Service', ServiceSchema);
const Category = mongoose.model('Category', CategorySchema);

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        console.log('--- Checking Categories ---');
        const categories = await Category.find({});
        categories.forEach(c => {
            console.log(`Category: '${c.name}' (ID: ${c._id})`);
        });

        console.log('\n--- Checking Specific Service ---');
        // Find "Switch & Socket Installation"
        const service = await Service.findOne({ title: /Switch/i });
        if (service) {
            console.log(`Service: ${service.title}`);
            console.log(`Assigned Category ID: ${service.category}`);

            const cat = await Category.findById(service.category);
            console.log(`Resolved Category Name: '${cat ? cat.name : 'NOT FOUND'}'`);
        } else {
            console.log('Service "Switch & Socket Installation" not found.');
        }

        console.log('\n--- Checking "Cleaning" Category Lookup ---');
        const cleaningName = "Cleaning";
        const regex = new RegExp(`^${cleaningName}$`, "i");
        const cleaningCat = await Category.findOne({ name: { $regex: regex } });
        console.log(`Looking for '${cleaningName}' with regex... Found: ${cleaningCat ? cleaningCat.name : 'NULL'}`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

debug();
