import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ServiceProvider from './src/models/ServiceProvider.js';
import User from './src/models/User.js';

dotenv.config();

const checkProviders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const providers = await ServiceProvider.find({});
        console.log(`Found ${providers.length} providers`);

        providers.forEach(p => {
            console.log(`Provider: ${p._id}`);
            console.log(`Certificates:`, p.certificates);
            console.log(`ID Proofs:`, p.idProofs);
            console.log(`Address Proofs:`, p.addressProofs);
            console.log('---');
        });

        mongoose.connection.close();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkProviders();
