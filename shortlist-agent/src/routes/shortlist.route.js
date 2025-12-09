import express from "express";
import * as authMiddleware from "../middlewares/auth.middleware.js";
import * as agentControllers from "../controllers/shortlist.controller.js";

const router = express.Router();

/* POST /api/shortlist/run */
router.post(
    "/run",
    authMiddleware.authMiddleware,
    agentControllers.shortlistCandidates
);

export default router;
