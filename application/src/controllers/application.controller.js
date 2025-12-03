import axios from "axios";
import applicationModel from "../models/application.model.js";

export async function jobApply(req, res) {
    const { source } = req.body;
    const { jobId } = req.params;
    const candidateId = req.user.id;

    try {
        const token =
            req.cookies?.token || req.headers?.authorization?.split(" ")[1];

        const resume = await axios.get(
            "http://localhost:3002/api/resume/latest",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!resume) {
            return res
                .status(404)
                .json({ message: "No resume found, Please upload one." });
        }

        const resumeId = resume.data.resume._id;

        const application = await applicationModel.create({
            candidateId,
            jobId,
            resumeId,
            source,
        });

        res.status(201).json({ message: "Applied sucessfully", application });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function allApplications(req, res) {
    const candidateId = req.user.id;
    try {
        const applications = await applicationModel.find({ candidateId });

        if (!applications) {
            return res
                .status(404)
                .json({ message: "No applications available." });
        }

        return res.status(200).json({ applications });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function allApplicationsRecruiter(req, res) {
    const { jobId } = req.params;
    const token =
        req.cookies?.token || req.headers?.authorization?.split(" ")[1];

    try {
        const applications = await applicationModel.find({ jobId });

        if (applications.length === 0) {
            return res
                .status(404)
                .json({ message: "No applications available." });
        }

        const candidateInfo = await Promise.all(
            applications.map(async (app) => {
                const { data } = await axios.get(
                    `http://localhost:3000/api/auth/${app.candidateId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                return {
                    applicationId: app._id,
                    status: app.status,
                    source: app.source,
                    candidate: {
                        fullName: data.user.fullName,
                        email: data.user.email,
                    },
                    resumeId: app.resumeId,
                };
            })
        );

        res.status(200).json({ candidateInfo });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function changeStatus(req, res) {
    const { status } = req.body;
    const { applicationId } = req.params;

    try {
        const newApplication = await applicationModel.findByIdAndUpdate(
            applicationId,
            status,
            { new: true }
        );

        if (!newApplication) {
            return res.status(404).json({ message: "No application found" });
        }

        res.status(200).json({
            message: "Application updated",
            newApplication,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function scheduleInterview(req, res) {
    const { scheduled, date, mode, notes } = req.body;
    const { applicationId } = req.params;

    try {
        const newApplication = await applicationModel.findByIdAndUpdate(
            applicationId,
            {
                interview: {
                    scheduled,
                    date,
                    mode,
                    notes,
                },
            },

            { new: true }
        );

        if (!newApplication) {
            return res.status(404).json({ message: "No application found" });
        }

        res.status(200).json({
            message: "Interview scheduled",
            newApplication,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
