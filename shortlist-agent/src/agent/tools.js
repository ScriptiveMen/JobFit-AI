import { tool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";
import shortlistRunModel from "../models/shortlistRun.model.js";

export const get_job_requirements = tool(
    async ({ jobId, token }) => {
        const res = await axios.get(`http://localhost:3003/api/jobs/${jobId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const job = res.data.job;

        return {
            jobId: job._id,
            requiredSkills: job.requiredSkills ?? [],
            niceToHaveSkills: job.niceToHaveSkills ?? [],
            experienceRequired: job.experienceRequired ?? 0,
        };
    },
    {
        name: "get_job_requirements",
        description: "Fetch job requirements needed for candidate comparison",
        schema: z.object({
            jobId: z.string(),
            token: z.string(),
        }),
    }
);

export const get_applications_of_job = tool(
    async ({ jobId, token }) => {
        const res = await axios.get(
            `http://localhost:3004/api/application/${jobId}/applications`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        return res.data.candidateInfo.map((a) => ({
            applicationId: a.applicationId,
            candidateId: a.candidate.id,
            resumeId: a.resumeId,
        }));
    },
    {
        name: "get_applications_of_job",
        description: "Fetch applications for a job (IDs only)",
        schema: z.object({
            jobId: z.string(),
            token: z.string(),
        }),
    }
);
export const get_resume_details = tool(
    async ({ userId, token }) => {
        const res = await axios.get(
            `http://localhost:3002/api/resume/${userId}/details`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const resume = res.data.resume;

        return {
            resumeId: resume._id,
            atsScore: resume.atsScore ?? 0,
            extractedSkills: resume.extractedSkills ?? [],
        };
    },
    {
        name: "get_resume_details",
        description:
            "Fetch extracted skills and ATS score for a candidate resume",
        schema: z.object({
            userId: z.string().describe("Candidate userId"),
            token: z.string(),
        }),
    }
);
export const save_to_DB = tool(
    async ({ jobId, countRequested, candidates }) => {
        await shortlistRunModel.create({
            jobId,
            countRequested,
            candidates,
        });

        return { status: "ok" };
    },
    {
        name: "save_to_DB",
        description: "Persist shortlisted candidates",
        schema: z.object({
            jobId: z.string(),
            countRequested: z.number(),
            candidates: z.array(
                z.object({
                    candidateId: z.string(),
                    applicationId: z.string(),
                    resumeId: z.string(),
                    atsScore: z.number(),
                    finalScore: z.number(),
                    reason: z.string(),
                })
            ),
        }),
    }
);
