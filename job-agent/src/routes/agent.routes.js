import express from "express";
import * as authMiddleware from "../middlewares/auth.middleware.js";
import * as agentController from "../controllers/agent.controllers.js";
const router = express.Router();

/* GET /api/agent/auto-apply */
router.get(
    "/auto-apply",
    authMiddleware.authMiddleware,
    agentController.autoApply
);

/* GET /api/agent/resume-suggestions/:jobId */
router.get(
    "/resume-suggestions/:jobId",
    authMiddleware.authMiddleware,
    agentController.resumeSuggestions
);

export default router;
