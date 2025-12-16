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
                    required: true,
                },
                applicationId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                },
                resumeId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                },
                atsScore: { type: Number, required: true },
                finalScore: { type: Number, required: true },
                reason: { type: String, required: true },
            },
        ],
    },
    { timestamps: true }
);

const shortlistRunModel = mongoose.model("shortlist", shortlistRunSchema);

export default shortlistRunModel;
