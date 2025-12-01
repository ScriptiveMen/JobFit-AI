import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
    {
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        resumeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resume",
            required: true,
        },
        status: {
            type: String,
            enum: ["applied", "shortlisted", "interview", "rejected", "hired"],
            default: "applied",
        },
        source: { type: String, enum: ["manual", "agent"], default: "manual" },
        interview: {
            scheduled: { type: Boolean, default: false },
            date: Date,
            mode: String, // "online" | "offline"
            notes: String,
        },
    },
    { timestamps: true }
);

const applicationModel = mongoose.model("application", applicationSchema);

export default applicationModel;
