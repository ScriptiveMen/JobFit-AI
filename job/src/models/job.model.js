import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
    {
        recruiterId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        title: { type: String, required: true },
        description: { type: String, required: true },
        skillsRequired: [String],
        experienceLevel: {
            type: String,
            enum: ["fresher", "junior", "mid", "senior"],
        },
        location: String,
        salaryRange: {
            min: Number,
            max: Number,
            currency: { type: String, default: "INR" },
        },
        status: { type: String, enum: ["open", "closed"], default: "open" },
    },
    { timestamps: true }
);

const jobModel = mongoose.model("job", jobSchema);

export default jobModel;
