import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Privilege from "../models/Privilege.js";
import Role from "../models/Role.js";

dotenv.config();

async function run() {
  await connectDB();

  // Base privileges set — evolve as needed
  const basePrivilegeNames = [
    // SuperAdmin powers
    "manage_privileges", "view_privileges",
    "manage_roles", "view_roles",
    "system_settings", "view_reports",

    // Admin powers
    "manage_users", "manage_providers", "manage_services",

    // Provider powers
    "manage_own_services",

    // User powers
    "view_services", "apply_professional"
  ];

  // Upsert privileges
  for (const name of basePrivilegeNames) {
    await Privilege.updateOne({ name }, { $set: { name } }, { upsert: true });
  }

  const allPrivs = await Privilege.find({});
  const map = Object.fromEntries(allPrivs.map(p => [p.name, p._id]));

  // Role definitions
  const roles = [
    {
      name: "super_admin",
      privileges: allPrivs.map(p => p._id) // all privileges
    },
    {
      name: "admin",
      privileges: [
        map["manage_users"],
        map["manage_providers"],
        map["manage_services"],
        map["view_reports"],
        map["view_services"]
      ].filter(Boolean)
    },
    {
      name: "service_provider",
      privileges: [
        map["manage_own_services"],
        map["view_services"]
      ].filter(Boolean)
    },
    {
      name: "user",
      privileges: [
        map["view_services"],
        map["apply_professional"]
      ].filter(Boolean)
    }
  ];

  // Upsert roles
  for (const r of roles) {
    await Role.updateOne({ name: r.name }, { $set: r }, { upsert: true });
  }

  console.log("✅ Roles and privileges seeded successfully");
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("❌ Seeding failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});