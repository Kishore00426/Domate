import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ServiceProvider from './src/models/ServiceProvider.js';
import path from 'path';

dotenv.config();

const fixProviderPaths = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const providers = await ServiceProvider.find({});
        console.log(`Found ${providers.length} providers`);

        let updatedCount = 0;

        for (const provider of providers) {
            let isModified = false;

            const fixPath = (filePath) => {
                if (filePath && filePath.includes('uploads')) {
                    // Check if it's already relative
                    if (filePath.startsWith('/uploads/') || filePath.startsWith('uploads/')) {
                        // Ensure starts with /
                        if (!filePath.startsWith('/')) return '/' + filePath;
                        return filePath;
                    }

                    // It's likely absolute, extract filename
                    const filename = path.basename(filePath);
                    return `/uploads/providers/${filename}`;
                }
                return filePath;
            };

            // Fix certificates
            if (provider.certificates && provider.certificates.length > 0) {
                const newCerts = provider.certificates.map(fixPath);
                // Simple check if changed (string comparison of arrays is simplistic but effectively checks if content changed)
                if (JSON.stringify(newCerts) !== JSON.stringify(provider.certificates)) {
                    provider.certificates = newCerts;
                    isModified = true;
                }
            }

            // Fix addressProofs
            if (provider.addressProofs && provider.addressProofs.length > 0) {
                const newAddr = provider.addressProofs.map(fixPath);
                if (JSON.stringify(newAddr) !== JSON.stringify(provider.addressProofs)) {
                    provider.addressProofs = newAddr;
                    isModified = true;
                }
            }

            // Fix idProofs
            if (provider.idProofs && provider.idProofs.length > 0) {
                const newIds = provider.idProofs.map(fixPath);
                if (JSON.stringify(newIds) !== JSON.stringify(provider.idProofs)) {
                    provider.idProofs = newIds;
                    isModified = true;
                }
            }

            if (isModified) {
                await provider.save();
                console.log(`Updated provider ${provider._id}`);
                updatedCount++;
            }
        }

        console.log(`Migration complete. Updated ${updatedCount} providers.`);
        process.exit(0);

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

fixProviderPaths();
