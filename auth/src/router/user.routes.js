import express from "express";
import * as userController from "../controllers/user.controller.js";
import * as userValidations from "../middlewares/validation.middleware.js";
import multer from "multer";
import authMiddleware from "../middlewares/auth.middleware.js";
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

/* POST /api/auth/register */
router.post(
    "/register",
    userValidations.registerUserValidation,
    userController.registerUser
);

/* POST /api/auth/login */
router.post(
    "/login",
    userValidations.loginUserValidation,
    userController.loginUser
);

/* GET /api/auth/me */
router.get("/me", authMiddleware, userController.getUser);

/* GET /api/auth/candidates/me */
router.get("/candidates/me", authMiddleware, userController.getCandidate);

/* GET /api/auth/recruiters/me */
router.get("/recruiters/me", authMiddleware, userController.getRecruiter);

/* PATCH /api/auth/candidates/me */
router.patch(
    "/candidates/me",
    authMiddleware,
    userController.updateCandidateProfile
);

/* PATCH /api/auth/recruiters/me */
router.patch(
    "/recruiters/me",
    authMiddleware,
    userController.updateRecruiterProfile
);

export default router;
