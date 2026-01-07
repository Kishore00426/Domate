import mongoose from 'mongoose';
import Category from './src/models/Category.js';
import Subcategory from './src/models/Subcategory.js';
import Service from './src/models/Service.js';
import fs from 'fs';

const checkAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB\n');

        let output = '';

        // Get all services
        const services = await Service.find({})
            .populate('category', 'name')
            .populate('subcategory', 'name');

        output += `Total services: ${services.length}\n\n`;

        services.forEach((s, idx) => {
            output += `${idx + 1}. "${s.title}"\n`;
            output += `   Category: ${s.category ? s.category.name : 'NULL'} (ID: ${s.category?._id || 'NULL'})\n`;
            output += `   Subcategory: ${s.subcategory ? s.subcategory.name : 'NULL'} (ID: ${s.subcategory?._id || 'NULL'})\n\n`;
        });

        console.log(output);
        fs.writeFileSync('service_assignments.txt', output);
        console.log('Output written to service_assignments.txt');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

checkAll();
