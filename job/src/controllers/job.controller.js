import jobModel from "../models/job.model.js";

export async function postJobs(req, res) {
    const {
        title,
        description,
        skillsRequired,
        experienceLevel,
        location,
        salaryRange,
        status,
    } = req.body;

    try {
        const job = await jobModel.create({
            recruiterId: req.user.id,
            title,
            description,
            skillsRequired,
            experienceLevel,
            location,
            salaryRange,
            status,
        });

        res.status(201).json({ message: "Job posted successfully", job });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to upload job" });
    }
}

export async function getJobs(req, res) {
    const {
        location,
        experienceLevel,
        skills,
        status,
        skip = 0,
        limit = 10,
    } = req.query;

    try {
        const filter = {};

        if (location) {
            filter.location = location;
        }
        if (experienceLevel) {
            filter.experienceLevel = experienceLevel;
        }
        if (status) {
            filter.status = status;
        }
        if (skills) {
            filter.skillsRequired = { $in: skills.split(",") };
        }

        const jobs = await jobModel.find(filter).skip(skip).limit(limit);

        return res.status(200).json({ jobs });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function getJobById(req, res) {
    try {
        const job = await jobModel.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: "No job found" });
        }
        return res
            .status(200)
            .json({ message: "Job fetched successfully", job });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function changeStatus(req, res) {
    const id = req.params.id;
    const { status } = req.body;

    try {
        const job = await jobModel.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );
        return res.status(200).json({ job });
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Internal server error: ", error });
    }
}

export async function getMyJobs(req, res) {
    const id = req.user.id;

    try {
        const jobs = await jobModel.find({ recruiterId: id });
        if (!jobs) {
            return res.status(404).json({ message: "No job posted!" });
        }

        return res.status(200).json({ jobs });
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Internal server error:", error });
    }
}
