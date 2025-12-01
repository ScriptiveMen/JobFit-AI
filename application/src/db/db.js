import mongoose from "mongoose";
import config from "../config/config.js";

async function connectDB() {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log("Error connecting to MongoDB", error);
    }
}

export default connectDB;
