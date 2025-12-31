import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import Role from "./src/models/Role.js";

dotenv.config();

console.log("Testing DB Connection...");
console.log("URI:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Connected to DB");
        try {
            const count = await User.countDocuments();
            console.log("User count:", count);

            const adminRole = await Role.findOne({ name: "admin" });
            console.log("Admin Role:", adminRole);

            if (adminRole) {
                const adminUser = await User.findOne({ role: adminRole._id });
                console.log("Found Admin User:", adminUser ? adminUser.email : "None");
            }
        } catch (e) {
            console.error("Query Error:", e);
        }
        process.exit(0);
    })
    .catch(err => {
        console.error("Connection Error:", err);
        process.exit(1);
    });
