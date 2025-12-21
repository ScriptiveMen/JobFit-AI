import { generateQuestionsAgent, verifyAnswerAgent } from "../agent/agent.js";
import practiceSessionModel from "../models/PracticeSession.model.js";

export async function getQuestions(req, res) {
    const { role } = req.query;

    const result = await generateQuestionsAgent({
        candidateId: req.user.id,
        role,
    });

    res.status(201).json(result);
}

export async function verifyAnswer(req, res) {
    const { sessionId, questionId, answerText } = req.body;

    const session = await practiceSessionModel.findById(sessionId);
    if (!session) {
        return res.status(404).json({ error: "Session not found" });
    }

    const evaluation = await verifyAnswerAgent({
        session,
        questionId,
        answerText,
    });

    res.json(evaluation);
}
