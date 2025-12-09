import mongoose from "mongoose";

const shortlistRunSchema = new mongoose.Schema(
    {
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        countRequested: {
            type: Number,
            required: true,
        },
        candidates: [
            {
                candidateId: {
                    type: mongoose.Schema.Types.ObjectId,
                },
                applicationId: {
                    type: mongoose.Schema.Types.ObjectId,
                },
                resumeId: {
                    type: mongoose.Schema.Types.ObjectId,
                },
                atsScore: Number,
                finalScore: Number,
                reason: String,
            },
        ],
    },
    { timestamps: true }
);

const shortlistRunModel = mongoose.model("shortlist", shortlistRunSchema);

export default shortlistRunModel;
