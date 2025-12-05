// src/agent/resumeSuggestionAgent.js
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import * as tools from "./tools.js";
import { z } from "zod";

// Define the shape we want back
const SuggestionsSchema = z.object({
    overall_fit: z.number(),
    missing_keywords: z.array(z.string()),
    improvements: z.array(z.string()),
    recommended_summary: z.string(),
});

const suggestionsModel = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0.3,
}).withStructuredOutput(SuggestionsSchema);

export async function getResumeSuggestions({ candidateId, jobId, token }) {
    // 1. Fetch resume
    const resume = await tools.get_resume_for_candidate.invoke({
        candidateId,
        token,
    });

    // 2. Fetch ALL jobs (or a specific job if you add a tool later)
    const jobs = await tools.get_open_jobs.invoke({ token });
    const job = jobs.find((j) => j._id === jobId);
    if (!job) {
        throw new Error("Job not found");
    }

    const prompt = `
Compare this resume with the job description and return:

- overall_fit: number from 0 to 1
- missing_keywords: important skills/keywords missing from resume
- improvements: concrete suggestions for improving the resume for this job
- recommended_summary: an improved professional summary text

Do NOT explain anything, just fill the fields.
  `;

    const suggestions = await suggestionsModel.invoke(`
${prompt}

Resume:
${JSON.stringify(resume, null, 2)}

Job:
${JSON.stringify(job, null, 2)}
  `);

    return suggestions;
}

export default getResumeSuggestions;
