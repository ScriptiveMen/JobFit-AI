import { tool } from "@langchain/core/tools";
import axios from "axios";
import { z } from "zod";
import shortlistRunModel from "../models/shortlistRun.model.js";

export const get_job_skills = tool(
    async ({ jobId, token }) => {
        const res = await axios.get(`http://localhost:3003/api/jobs/${jobId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return res.data.jobs;
    },
    {
        name: "get_job_skills",
        description: "Get the skills of job",
        schema: z.object({
            jobId: z.string().describe("Id for job"),
            token: z.string().describe("JWT token for auth"),
        }),
    }
);
export const get_candidates_of_job = tool(
    async ({ jobId, token }) => {
        const res = await axios.get(
            `http://localhost:3004/api/application/${jobId}/applications`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return res.data.candidateInfo;
    },
    {
        name: "get_candidates_of_job",
        description: "fetches the applied candidates of the job",
        schema: z.object({
            jobId: z.string().describe("Id for job"),
            token: z.string().describe("JWT token for auth"),
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

        return "saved to DB";
    },
    {
        name: "save_to_DB",
        description: "saves the shortlisted candidates in DB.",
        schema: z.object({
            jobId: z.string().describe("Id of job"),
            countRequested: z
                .number()
                .describe("count of requested candidates to shortlist"),
            candidates: z.array(z.object()).describe("shortlisted candidates"),
        }),
    }
);
