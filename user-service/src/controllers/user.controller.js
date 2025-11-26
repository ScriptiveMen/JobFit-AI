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
        email,
        password: hashPassword,
        role,
    });

    let profile;

    if (userDoc.role === "recruiter") {
        profile = await recruiterProfileModel.create({
            userId: userDoc._id,
            companyDescription,
            companyName,
            contactNumber,
            fullName,
            website,
        });
    } else if (userDoc.role === "candidate") {
        profile = await candidateProfileModel.create({
            userId: userDoc.id,
            fullName,
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
            id: profile._id,
            fullName: profile.fullName,
            role: profile._id,
        },
        config.JWT_SECRET_KEY,
        { expiresIn: "7d" }
    );

    res.cookie("token", token);

    return res
        .status(201)
        .json({ message: "user created sucessfully", profile });
}
