import mongoose from "mongoose";

const recruiterProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    companyName: {
        type: String,
        required: true,
    },
    companyDescription: {
        type: String,
    },
    website: {
        type: String,
    },
    logoUrl: {
        type: String,
    },
    contactNumber: {
        type: String,
        required: true,
    },
});

const recruiterProfileModel = mongoose.model(
    "recruiterProfile",
    recruiterProfileSchema
);

export default recruiterProfileModel;
