import express from "express";
import * as authMiddleware from "../middlewares/auth.middleware.js";
import * as jobController from "../controllers/job.controller.js";
import * as jobValidation from "../middlewares/validation.middleware.js";

const router = express.Router();

/* POST /api/jobs/ (recruiter only) */
router.post(
    "/",
    authMiddleware.recruiterMiddleware,
    jobValidation.jobUploadValidation,
    jobController.postJobs
);

/* GET /api/jobs/ (candidate only) */
router.get("/", authMiddleware.authMiddleware, jobController.getJobs);

/* GET /api/jobs/me */
router.get("/me", authMiddleware.recruiterMiddleware, jobController.getMyJobs);

/* GET /api/jobs/id */
router.get("/:id", authMiddleware.authMiddleware, jobController.getJobById);

/* PATCH /api/jobs/id/status */
router.patch(
    "/:id/status",
    authMiddleware.recruiterMiddleware,
    jobController.changeStatus
);

export default router;
