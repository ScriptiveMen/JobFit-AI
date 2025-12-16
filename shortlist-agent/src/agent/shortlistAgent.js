import { z } from "zod";
import * as tools from "./tools.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph } from "@langchain/langgraph";

const CandidateSchema = z.object({
    candidateId: z.string(),
    applicationId: z.string(),
    resumeId: z.string(),
    atsScore: z.number().min(0).max(100),
    finalScore: z.number().min(0).max(100),
    reason: z.string(),
});

const GraphStateData = z.object({
    jobId: z.string(),
    countRequested: z.number(),

    jobRequirements: z
        .object({
            requiredSkills: z.array(z.string()),
            niceToHaveSkills: z.array(z.string()),
        })
        .optional(),

    applications: z
        .array(
            z.object({
                applicationId: z.string(),
                candidateId: z.string(),
                resumeId: z.string(),
            })
        )
        .optional(),

    llmCandidates: z
        .array(
            z.object({
                candidateId: z.string(),
                applicationId: z.string(),
                resumeId: z.string(),
                skills: z.array(z.string()),
                atsScore: z.number(),
            })
        )
        .optional(),

    shortlisted: z.array(CandidateSchema).optional(),
});

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0.2,
    maxRetries: 0,
});

const graph = new StateGraph(GraphStateData)

    /* 1️⃣ Fetch job requirements */
    .addNode("fetchJobRequirements", async (state, config) => {
        const token = config?.metadata?.token;

        const jobRequirements = await tools.get_job_requirements.invoke({
            jobId: state.jobId,
            token,
        });

        return { ...state, jobRequirements };
    })

    /* 2️⃣ Fetch applications */
    .addNode("fetchApplications", async (state, config) => {
        const token = config?.metadata?.token;

        const applications = await tools.get_applications_of_job.invoke({
            jobId: state.jobId,
            token,
        });

        return { ...state, applications };
    })

    /* 3️⃣ Fetch resume insights (skills + ATS) */
    .addNode("fetchResumeInsights", async (state, config) => {
        const token = config?.metadata?.token;

        // 1️⃣ Deduplicate candidateIds
        const uniqueCandidateIds = [
            ...new Set(state.applications.map((a) => a.candidateId)),
        ];

        // 2️⃣ Fetch resume details ONCE per candidate
        const resumeDetails = await Promise.all(
            uniqueCandidateIds.map((candidateId) => {
                if (!candidateId) {
                    throw new Error(
                        "Missing candidateId while fetching resumes"
                    );
                }

                // ✅ RETURN is critical
                return tools.get_resume_details.invoke({
                    userId: candidateId,
                    token,
                });
            })
        );

        // 3️⃣ Build resume map safely
        const resumeMap = {};
        for (const r of resumeDetails) {
            if (!r || !r.resumeId) continue;
            resumeMap[r.resumeId] = r;
        }

        // 4️⃣ Build LLM candidates
        const llmCandidates = state.applications.map((app) => {
            const resume = resumeMap[app.resumeId];

            return {
                candidateId: app.candidateId,
                applicationId: app.applicationId,
                resumeId: app.resumeId,
                skills: resume?.extractedSkills ?? [],
                atsScore: resume?.atsScore ?? 0,
            };
        });

        return { ...state, llmCandidates };
    })

    /* 4️⃣ ONE LLM CALL: rank candidates */
    .addNode("rankCandidates", async (state) => {
        const { countRequested, jobRequirements, llmCandidates } = state;

        const prompt = `
You are an AI recruiter.

Job required skills:
${jobRequirements.requiredSkills.join(", ")}

Candidates:
${llmCandidates
    .map(
        (c, i) => `
${i + 1}. Skills: ${c.skills.join(", ")}
   ATS Score: ${c.atsScore}
`
    )
    .join("")}

Shortlist at most ${countRequested} candidates.

Return JSON array only:
[
  {
    "index": number,
    "finalScore": number (0-100),
    "reason": string
  }
]
`;

        const response = await model.invoke(prompt);
        const ranked = JSON.parse(response.content);

        const shortlisted = ranked.slice(0, countRequested).map((r) => {
            const c = llmCandidates[r.index];
            return {
                candidateId: c.candidateId,
                applicationId: c.applicationId,
                resumeId: c.resumeId,
                atsScore: c.atsScore,
                finalScore: r.finalScore,
                reason: r.reason,
            };
        });

        return { ...state, shortlisted };
    })

    /* 5️⃣ Save to DB */
    .addNode("saveToDB", async (state) => {
        await tools.save_to_DB.invoke({
            jobId: state.jobId,
            countRequested: state.countRequested,
            candidates: state.shortlisted,
        });

        return state;
    })

    .addEdge("__start__", "fetchJobRequirements")
    .addEdge("fetchJobRequirements", "fetchApplications")
    .addEdge("fetchApplications", "fetchResumeInsights")
    .addEdge("fetchResumeInsights", "rankCandidates")
    .addEdge("rankCandidates", "saveToDB")
    .addEdge("saveToDB", "__end__");

const shortlistAgent = graph.compile();
export default shortlistAgent;
