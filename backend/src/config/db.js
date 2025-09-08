import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    // Use the exact case that already exists in MongoDB
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/MaabDesign";
    await mongoose.connect(mongoURI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.log("MongoDB Connection Error:", err.message);
    console.log("Server will continue without database connection for testing...");
  }
};

export default connectDB;
