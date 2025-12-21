import mongoose from "mongoose";

const practiceSessionSchema = new mongoose.Schema(
    {
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
            required: true,
        },
        role: String,
        questions: [
            {
                _id: false,
                questionId: String,
                questionText: String,
                category: String,
                answerText: String,
                feedback: String,
                score: Number,
            },
        ],
    },
    { timestamps: true }
);

const practiceSessionModel = mongoose.model(
    "PracticeSession",
    practiceSessionSchema
);

export default practiceSessionModel;
