import userModel from "../models/user.model.js";
import recruiterProfileModel from "../models/recruiterProfile.model.js";
import candidateProfileModel from "../models/candidateProfile.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

export async function registerUser(req, res) {
    const {
        email,
        password,
        role,
        fullName,

        //candidate
        about,
        preferredRole,
        skills,
        experienceYears,

        //recruiter
        companyName,
        companyDescription,
        website,
        contactNumber,
    } = req.body;

    const isUserExists = await userModel.findOne({ email });

    if (isUserExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const userDoc = await userModel.create({
        fullName,
        email,
        password: hashPassword,
        role,
    });

    if (userDoc.role === "recruiter") {
        await recruiterProfileModel.create({
            userId: userDoc._id,
            companyDescription,
            companyName,
            contactNumber,
            website,
        });
    } else if (userDoc.role === "candidate") {
        await candidateProfileModel.create({
            userId: userDoc.id,
            about,
            experienceYears,
            preferredRole,
            skills,
        });
    } else {
        return res.status(400).json({ message: "Invalid role" });
    }

    const token = jwt.sign(
        {
            id: userDoc._id,
            fullName: userDoc.fullName,
            role: userDoc._id,
        },
        config.JWT_SECRET_KEY,
        { expiresIn: "7d" }
    );

    res.cookie("token", token);

    return res.status(201).json({
        message: "user created sucessfully",
        user: {
            id: userDoc._id,
            email: userDoc.email,
            role: userDoc.role,
        },
    });
}

export async function loginUser(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(403).json({ message: "Invalid email or password" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        return res.status(403).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
        {
            id: user._id,
            fullName: user.fullName,
            role: user.role,
        },
        config.JWT_SECRET_KEY,
        { expiresIn: "7d" }
    );

    res.cookie("token", token);
    res.status(200).json({
        user: {
            id: user._id,
            email: user.email,
            role: user.role,
        },
    });
}

export async function getUser(req, res) {
    res.status(200).json({
        message: "Fetched user",
        user: {
            id: req.user.id,
            fullName: req.user.fullName,
            role: req.user.role,
        },
    });
}

export async function getCandidate(req, res) {
    const id = req.user.id;

    if (req.user.role !== "candidate") {
        return res.status(403).json({ message: "Not a candidate" });
    }

    const profile = await candidateProfileModel.findOne({ userId: id });

    if (!profile) {
        return res.status(404).json({ message: "No profile found" });
    }

    res.status(200).json({
        user: {
            userId: profile.userId,
            about: profile.about,
            experienceYears: profile.experienceYears,
            preferredRole: profile.preferredRole,
            skills: profile.skills,
        },
    });
}

export async function getRecruiter(req, res) {
    const id = req.user.id;

    if (req.user.role !== "recruiter") {
        return res.status(403).json({ message: "Not a recruiter" });
    }

    const profile = await recruiterProfileModel.findOne({ userId: id });

    if (!profile) {
        return res.status(403).json({ message: "No profile found" });
    }

    res.status(200).json({
        user: {
            userId: profile.userId,
            companyName: profile.companyName,
            companyDescription: profile.companyDescription,
            website: profile.website,
            logoUrl: profile.logoUrl,
            contactNumber: profile.contactNumber,
        },
    });
}

export async function updateCandidateProfile(req, res) {
    const id = req.user.id;

    if (req.user.role !== "candidate") {
        return res.status(403).json({ message: "Not a candidate" });
    }

    const updatedProfile = await candidateProfileModel.findOneAndUpdate(
        {
            userId: id,
        },
        req.body,
        { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
        message: "Profile updated",
        user: {
            userId: updatedProfile.userId,
            about: updatedProfile.about,
            experienceYears: updatedProfile.experienceYears,
            preferredRole: updatedProfile.preferredRole,
            skills: updatedProfile.skills,
        },
    });
}

export async function updateRecruiterProfile(req, res) {
    const id = req.user.id;
    if (req.user.role !== "recruiter") {
        return res.status(403).json({ message: "Not a recruiter" });
    }

    const updatedProfile = await recruiterProfileModel.findOneAndUpdate(
        {
            userId: id,
        },
        req.body,
        { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
        message: "updated recruiter profile",
        user: {
            companyName: updatedProfile.companyName,
            companyDescription: updatedProfile.companyDescription,
            website: updatedProfile.website,
            logoUrl: updatedProfile.logoUrl,
            contactNumber: updatedProfile.contactNumber,
        },
    });
}

export async function getUserDetails(req, res) {
    const { userId } = req.params;

    try {
        const user = await userModel
            .findById(userId)
            .select(" -password -googleId");

        if (!user) {
            return res.status(404).json({ message: "No user found" });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
