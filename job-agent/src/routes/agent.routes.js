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

export default router;
