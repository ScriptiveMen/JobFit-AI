import express from "express";
import multer from "multer";
import authMiddleware from "../middlewares/auth.middleware.js";
import * as resumeController from "../controllers/resume.controller.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

/* POST /api/resume/upload */
router.post(
    "/upload",
    authMiddleware,
    upload.single("resume"),
    resumeController.uploadResume
);

export default router;
