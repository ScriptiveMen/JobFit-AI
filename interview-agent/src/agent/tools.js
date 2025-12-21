// tools.js
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import PracticeSessionModel from "../models/PracticeSession.model.js";

export const savePracticeSession = tool(
    async ({ _id, candidateId, role, questions }) => {
        if (!_id) {
            const session = await PracticeSessionModel.create({
                candidateId,
                role,
                questions,
            });

            return { _id: session._id.toString() };
        }

        await PracticeSessionModel.findByIdAndUpdate(_id, {
            $set: { questions },
        });

        return { _id };
    },
    {
        name: "savePracticeSession",
        description: "Create or update interview practice session",
        schema: z.object({
            _id: z.string().optional(),
            candidateId: z.string(),
            role: z.string(),
            questions: z.array(
                z.object({
                    questionId: z.string(),
                    questionText: z.string().optional(),
                    category: z.string().optional(),
                    answerText: z.string().optional(),
                    feedback: z.string().optional(),
                    score: z.number().min(0).max(10).optional(),
                })
            ),
        }),
    }
);
