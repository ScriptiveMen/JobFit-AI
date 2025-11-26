import jwt from "jsonwebtoken";
import config from "../config/config.js";

async function authMiddleware(req, res, next) {
    const { token } = req.cookie;

    if (!token) {
        return res.status(403).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET_KEY);
        req.user = decoded;
    } catch (error) {
        console.log(error);
        return res.status(403).json({ message: "Invalid token" });
    }
}

export default authMiddleware;
