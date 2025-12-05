// src/agent/agent.js
import { StateGraph } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import * as tools from "./tools.js";
import { z } from "zod";

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0.5,
});

// 1) Decision schema (what LLM returns)
const DecisionSchema = z.object({
    accepted: z.boolean(),
    jobId: z.string().nullable(), // null if not applying
    matchScore: z.number(), // 0-1
    reason: z.string(),
});

const decideModel = model.withStructuredOutput(DecisionSchema);

// 2) Graph state schema (what flows between nodes)
const GraphState = z.object({
    candidateId: z.string(),
    userId: z.string(),

    resume: z.any().optional(),
    jobs: z.any().optional(),
    decision: DecisionSchema.optional(),
    application: z.any().optional(),
});

// 3) Build graph with schema
const graph = new StateGraph(GraphState)
    .addNode("fetchResume", async (state, config) => {
        const token = config?.metadata?.token;
        const { candidateId } = state;

        const resume = await tools.get_resume_for_candidate.invoke({
            candidateId,
            token,
        });

        return { resume };
    })
    .addNode("findJobs", async (state, config) => {
        const token = config?.metadata?.token;

        const jobs = await tools.get_open_jobs.invoke({ token });
        return { jobs };
    })
    .addNode("llmMatch", async (state) => {
        const { resume, jobs } = state;

        const prompt = `
You are an auto-apply decision engine.

Given a candidate resume and a list of open jobs:
- Pick at most ONE job to apply to.
- Or decide not to apply at all.

Return:
- accepted: true if we should apply, otherwise false
- jobId: the chosen job ID, or null if not applying
- matchScore: a number between 0 and 1
- reason: short explanation

Resume:
${JSON.stringify(resume, null, 2)}

Jobs:
${JSON.stringify(jobs, null, 2)}
    `;

        const decision = await decideModel.invoke(prompt);
        return { decision };
    })
    .addNode("createApplication", async (state, config) => {
        const token = config?.metadata?.token;
        const { decision } = state;

        if (!decision.accepted || !decision.jobId) {
            return { application: null };
        }

        const application = await tools.create_application_for_job.invoke({
            jobId: decision.jobId,
            token,
        });

        return { application };
    })
    .addNode("logDecision", async (state) => {
        const { decision, resume, userId } = state;
        const { accepted, jobId, matchScore, reason } = decision;

        const resumeId = resume?._id;

        await tools.log_agent_decision.invoke({
            userId,
            jobId,
            resumeId,
            matchScore,
            accepted,
            reason,
        });

        return {};
    })

    .addEdge("__start__", "fetchResume")
    .addEdge("fetchResume", "findJobs")
    .addEdge("findJobs", "llmMatch")
    .addConditionalEdges("llmMatch", (state) => {
        return state.decision?.accepted ? "createApplication" : "logDecision";
    })
    .addEdge("createApplication", "logDecision")
    .addEdge("logDecision", "__end__");

const agent = graph.compile();

export default agent;
