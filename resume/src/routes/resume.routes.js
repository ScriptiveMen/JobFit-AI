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

/* GET /api/resume/latest */
router.get("/latest", authMiddleware, resumeController.getLatestResume);

/* GET /api/resume/:id */
router.get("/:id", authMiddleware, resumeController.analyseResume);

/* GET /api/resume/:candidateId/details */
router.get(
    "/:candidateId/details",
    authMiddleware,
    resumeController.getResumeDetails
);

export default router;
