import mongoose from "mongoose";
import config from "../config/config.js";
import Imagekit from "imagekit";

const imagekit = new Imagekit({
    publicKey: config.IMAGEKIT_PUBLIC_KEY,
    privateKey: config.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: config.IMAGEKIT_URL_ENDPOINT,
});

async function uploadFile(file) {
    try {
        return await imagekit.upload({
            file: file.buffer,
            fileName: new mongoose.Types.ObjectId().toString(),
            folder: "JobFit-AI",
        });
    } catch (err) {
        console.log(err);
        throw new Error(`Resume upload failed: ${err?.message || err}`);
    }
}

export default uploadFile;
