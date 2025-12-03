import express from "express";
import * as authMiddleware from "../middlewares/auth.middleware.js";
import * as applicationController from "../controllers/application.controller.js";

const router = express.Router();

/* POST /api/application/:jobId/apply */
router.post(
    "/:jobId/apply",
    authMiddleware.authMiddleware,
    applicationController.jobApply
);

/* GET /api/application/me */
router.get(
    "/me",
    authMiddleware.authMiddleware,
    applicationController.allApplications
);

/* GET /api/application/:jobId/applications (recruiter)*/
router.get(
    "/:jobId/applications",
    authMiddleware.recruiterMiddleware,
    applicationController.allApplicationsRecruiter
);

/* PATCH /api/application/:applicationId/status (recruiter) */
router.patch(
    "/:applicationId/status",
    authMiddleware.recruiterMiddleware,
    applicationController.changeStatus
);

/* PATCH /api/application/:applicationId/interview(recruiter) */
router.patch(
    "/:applicationId/interview",
    authMiddleware.recruiterMiddleware,
    applicationController.scheduleInterview
);

export default router;
