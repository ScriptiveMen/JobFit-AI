import { tool } from "@langchain/core/tools";
import { z } from "zod";
import axios from "axios";
import suggestionLogModel from "../models/agent.model.js";

export const get_resume_for_candidate = tool(
    async ({ candidateId, token }) => {
        const resume = await axios.get(
            `http://localhost:3002/api/resume/${candidateId}/details`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return resume.data.resume;
    },
    {
        name: "get_resume_for_candidate",
        description: "Get the resume of candidate",
        schema: z.object({
            candidateId: z.string().describe("Candidate id"),
            token: z.string().describe("JWT token for auth"),
        }),
    }
);

export const get_open_jobs = tool(
    async ({ token }) => {
        const jobs = await axios.get(
            `http://localhost:3003/api/jobs?status=open`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return jobs.data.jobs;
    },
    {
        name: "get_open_jobs",
        description: "Get Open Jobs",
        schema: z.object({
            token: z.string().describe("JWT token for auth"), // 👈 added
        }),
    }
);

export const create_application_for_job = tool(
    async ({ jobId, token }) => {
        const application = await axios.post(
            `http://localhost:3004/api/application/${jobId}/apply`,
            { source: "agent" },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return application.data.application;
    },
    {
        name: "create_application_for_job",
        description: "Creates one new application for job",
        schema: z.object({
            jobId: z.string().describe("Id for job post"),
            token: z.string().describe("JWT token for auth"),
        }),
    }
);

export const log_agent_decision = tool(
    async ({ userId, jobId, resumeId, matchScore, accepted, reason }) => {
        await suggestionLogModel.create({
            userId,
            jobId,
            resumeId,
            matchScore,
            accepted,
            reason,
        });

        return "logged";
    },
    {
        name: "log_agent_decision",
        description: "Always logs the agent's decision for a particular user",
        schema: z.object({
            userId: z.string().describe("ID of the current user"),
            jobId: z.string().describe("ID of job post"),
            resumeId: z.string().describe("Id of current resume"),
            matchScore: z
                .number()
                .describe("Matching score between job and resume"),
            accepted: z
                .boolean()
                .describe("Whether the agent applied or skipped"),
            reason: z
                .string()
                .describe("Why the agent chose or skipped this job"),
        }),
    }
);
