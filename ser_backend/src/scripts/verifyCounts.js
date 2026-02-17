import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import Booking from "../models/Booking.js";
import Service from "../models/Service.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

(async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("❌ MONGO_URI not found");
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Custom Script: DB Connected");

        const bookingCount = await Booking.countDocuments();
        const serviceCount = await Service.countDocuments();

        const output = `Bookings: ${bookingCount}, Services: ${serviceCount}`;
        console.log(output);
        const fs = await import("fs");
        fs.writeFileSync("counts.txt", output);

        process.exit(0);
    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
})();
