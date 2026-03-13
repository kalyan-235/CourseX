import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL;

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
};

export default connectDB;