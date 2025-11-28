import resumeModel from "../models/resume.model.js";
import uploadFile from "../services/storage.service.js";

export async function uploadResume(req, res) {
    const file = await uploadFile(req.file);

    const resume = await resumeModel.create({
        userId: req.user.id,
        fileUrl: file.url,
    });

    res.status(201).json({ message: "Resume uploaded.", resume });
}
