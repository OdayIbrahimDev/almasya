import mongoose from "mongoose";
import Users from "../models/Users.js";
import connectDB from "../config/db.js";
import bcrypt from "bcryptjs";

const createAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await Users.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log("✅ Admin user already exists!");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      process.exit(0);
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    const adminUser = new Users({
      name: "مدير النظام",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin"
    });

    await adminUser.save();

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email: admin@example.com");
    console.log("🔑 Password: admin123");
    console.log("⚠️  Please change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
