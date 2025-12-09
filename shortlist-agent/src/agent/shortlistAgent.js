import { z } from "zod";
import * as tools from "./tools.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph } from "@langchain/langgraph";

const CandidateSchema = z.object({
    candidateId: z.string(),
    applicationId: z.string(),
    resumeId: z.string().optional().nullable(),
    atsScore: z.number().min(0).max(100),
    finalScore: z.number().min(0).max(100),
    reason: z.string(),
});

const StructuredOutput = z.object({
    jobId: z.string(),
    countRequested: z.number(),
    candidates: z.array(CandidateSchema),
    noGoodCandidate: z
        .boolean()
        .optional()
        .describe("true if none of the candidates are a good fit for the job"),
});

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
}).withStructuredOutput(StructuredOutput);

const GraphStateData = z.object({
    jobId: z.string(),
    countRequested: z.number(),
    skills: z.array(z.string()).optional(),
    candidateInfo: z.array(z.any()).optional(), // shape depends on your API response
    candidates: z.array(CandidateSchema).optional().default([]),
    noGoodCandidate: z.boolean().optional(),
});

const graph = new StateGraph(GraphStateData)
    .addNode("FetchSkills", async (state, config) => {
        const token = config?.metadata?.token;
        const { jobId } = state;

        const skills = await tools.get_job_skills.invoke({ jobId, token });

        return { ...state, skills };
    })
    .addNode("getAppliedCandidates", async (state, config) => {
        const token = config?.metadata?.token;
        const { jobId } = state;

        const candidateInfo = await tools.get_candidates_of_job.invoke({
            jobId,
            token,
        });

        return { ...state, candidateInfo };
    })
    .addNode("llmCompare", async (state) => {
        const { countRequested, skills, candidateInfo } = state;

        const prompt = `
You are an AI recruiter assistant.

Job skills/requirements:
${JSON.stringify(skills, null, 2)}

Candidates:
${JSON.stringify(candidateInfo, null, 2)}

countRequested: ${countRequested}

Return at most "countRequested" candidates.
If NONE are a good fit, set "noGoodCandidate" to true and return an empty candidates array.
`;

        const result = await model.invoke(prompt);
        return {
            ...state,
            jobId: result.jobId,
            countRequested: result.countRequested,
            candidates: result.candidates,
            noGoodCandidate: result.noGoodCandidate ?? false,
        };
    })
    .addNode("saveToDB", async (state) => {
        const { jobId, countRequested, candidates } = state;

        await tools.save_to_DB.invoke({
            jobId,
            countRequested,
            candidates,
        });

        return state;
    })
    .addNode("noGoodCandidates", async (state) => {
        return { ...state, candidates: [], noGoodCandidate: true };
    })

    .addEdge("__start__", "FetchSkills")
    .addEdge("FetchSkills", "getAppliedCandidates")
    .addEdge("getAppliedCandidates", "llmCompare")
    .addConditionalEdges("llmCompare", (state) => {
        if (
            state.noGoodCandidate ||
            !state.candidates ||
            state.candidates.length === 0
        ) {
            return "noGoodCandidates";
        }
        return "saveToDB";
    })
    .addEdge("saveToDB", "__end__")
    .addEdge("noGoodCandidates", "__end__");

const shortlistAgent = graph.compile();

export default shortlistAgent;
