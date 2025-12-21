import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { savePracticeSession } from "./tools.js";
import { safeJsonParse } from "../utils/parseJson.js";

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.4,
});

export async function generateQuestionsAgent({ candidateId, role }) {
    const prompt = `
        You are an interview practice assistant.

        Generate 5 interview questions for the role: ${role}

        Rules:
        - Output JSON only
        - No explanations
        - No buzzwords
        - Keep language simple

        Format:
        {
        "questions": [
            {
            "questionId": "q1",
            "questionText": "...",
            "category": "technical"
            }
        ]
        }
`;

    const res = await model.invoke(prompt);
    const parsed = safeJsonParse(res.content);
    const questions = parsed.questions;

    const dbRes = await savePracticeSession.invoke({
        candidateId,
        role,
        questions,
    });

    return {
        sessionId: dbRes._id,
        questions,
    };
}

export async function verifyAnswerAgent({ session, questionId, answerText }) {
    const question = session.questions.find((q) => q.questionId === questionId);

    question.answerText = answerText;

    const prompt = `
        Question:
        ${question.questionText}

        Answer:
        ${answerText}

        Evaluate the answer.

        Rules:
        - Output JSON only
        - score must be integer (0–10)
        - Feedback must be constructive

        Format:
        {
        "feedback": "...",
        "score": 7
        }
`;

    const res = await model.invoke(prompt);
    const evaluation = safeJsonParse(res.content);

    question.feedback = evaluation.feedback;
    question.score = evaluation.score;

    await savePracticeSession.invoke({
        _id: session._id.toString(),
        candidateId: session.candidateId.toString(),
        role: session.role,
        questions: session.questions,
    });

    return evaluation;
}
