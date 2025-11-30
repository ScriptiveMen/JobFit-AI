import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        fileUrl: {
            type: String,
            required: true,
        },
        atsScore: {
            type: Number,
            default: 0,
        },
        issues: [
            {
                type: {
                    type: String,
                },
                message: {
                    type: String,
                },
            },
        ],

        suggestions: [String],

        extractedSkills: [String],

        isLatest: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const resumeModel = mongoose.model("resume", resumeSchema);

export default resumeModel;
