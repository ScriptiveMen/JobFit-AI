import resumeModel from "../models/resume.model.js";
import uploadFile from "../services/storage.service.js";
import { analyzeResumeFile, getDetails } from "../services/ai.service.js";
import axios from "axios";

export async function uploadResume(req, res) {
    try {
        const uploaded = await uploadFile(req.file);

        const analysis = await analyzeResumeFile(req.file);

        const resume = await resumeModel.create({
            userId: req.user.id,
            fileUrl: uploaded.url,
            atsScore: analysis.atsScore,
            issues: analysis.issues,
            suggestions: analysis.suggestions,
            extractedSkills: analysis.extractedSkills,
            isLatest: true,
        });

        return res.status(201).json({
            message: "Resume uploaded and analyzed.",
            resume,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to analyse resume" });
    }
}

export async function getLatestResume(req, res) {
    const id = req.user.id;

    try {
        const resume = await resumeModel.findOne({ userId: id });
        return res
            .status(200)
            .json({ message: "Resume fetched sucessfully", resume });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to fetch resume" });
    }
}

export async function analyseResume(req, res) {
    const { id } = req.params;

    if (req.user.role !== "recruiter") {
        return res.status(403).json({ message: "Forbidden, not a recruiter" });
    }

    const resume = await resumeModel.findOne({ userId: id });

    if (!resume) {
        return res.status(404).json({ message: "No resume found" });
    }

    const fileResponse = await axios.get(resume.fileUrl, {
        responseType: "arraybuffer",
    });

    const file = {
        buffer: Buffer.from(fileResponse.data),
        mimetype: "application/pdf",
    };

    const summary = await getDetails(file);

    return res.status(200).json({
        resumeId: resume._id,
        candidateId: resume.userId,
        fileUrl: resume.fileUrl,
        atsScore: resume.atsScore ?? null,
        summary,
    });
}

export async function getResumeDetails(req, res) {
    const { candidateId } = req.params;
    try {
        const resume = await resumeModel.findOne({ userId: candidateId });
        if (!resume) {
            return res.status(404).json({ message: "No resume found" });
        }
        res.status(200).json({ resume });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
