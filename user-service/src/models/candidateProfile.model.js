import mongoose from "mongoose";

const candidateProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        fullName: {
            firstName: {
                type: String,
                required: true,
            },

            lastName: {
                type: String,
                required: true,
            },
        },
        experienceYears: {
            type: Number,
            default: 0,
        },
        preferredRole: { type: String },
        skills: [String],
        about: { type: String },
    },
    { timestamps: true }
);

const candidateProfileModel = mongoose.model(
    "CandidateProfile",
    candidateProfileSchema
);

export default candidateProfileModel;
