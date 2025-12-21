import express from "express";
import * as authMiddleware from "../middlewares/auth.middleware.js";
import * as agentController from "../controllers/interviewAgent.controller.js";

const router = express.Router();

/* GET /api/practice/today?role=frontend */
router.get(
    "/today",
    authMiddleware.authMiddleware,
    agentController.getQuestions
);

/* POST /api/practice/answer */
router.post(
    "/answer",
    authMiddleware.authMiddleware,
    agentController.verifyAnswer
);

export default router;
