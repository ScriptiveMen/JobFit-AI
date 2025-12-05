import mongoose from "mongoose";

const suggestionLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        resumeId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        matchScore: Number,
        accepted: Boolean, // agent applied or not
        reason: String, // optional: why it chose/skipped
    },
    { timestamps: true }
);

const suggestionLogModel = mongoose.model("suggestion", suggestionLogSchema);

export default suggestionLogModel;
