import mongoose from "mongoose";
import config from "../config/config.js";

async function connectDB() {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.log("Error connecting MongoDb: ", err);
    }
}

export default connectDB;
