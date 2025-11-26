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

export default router;
