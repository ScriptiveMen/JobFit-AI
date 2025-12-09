import jwt from "jsonwebtoken";
import config from "../config/config.js";

export async function authMiddleware(req, res, next) {
    const token =
        req.cookies?.token || req.headers?.authorization?.split(" ")[1];

    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET_KEY);
        req.user = decoded;
        req.token = token;
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid token or expired" });
    }
}

export async function recruiterMiddleware(req, res, next) {
    const token =
        req.cookies?.token || req.headers?.authorization?.split(" ")[1];

    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET_KEY);
        if (decoded.role !== "recruiter") {
            return res
                .status(403)
                .json({ message: "Forbidden, recruiter only" });
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid token or expired" });
    }
}

export default authMiddleware;
