import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import User from "../models/User.js";
import Role from "../models/Role.js";
import bcrypt from "bcryptjs";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ DB Connected");

        const adminRole = await Role.findOne({ name: "admin" });
        if (!adminRole) {
            console.error("❌ Admin role not found. Run seedRoles first.");
            process.exit(1);
        }

        const email = "admin_debug@example.com";
        const password = "password123";
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            console.log("⚠️ User found, updating...");
            user.password = hashedPassword;
            user.role = adminRole._id;
            await user.save();
        } else {
            console.log("creating new admin...");
            user = await User.create({
                username: "DebugAdmin",
                email,
                password: hashedPassword,
                role: adminRole._id,
                contactNumber: "1234567890"
            });
        }

        console.log(`✅ Admin ready: ${email} / ${password}`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Failed:", error);
        process.exit(1);
    }
})();
