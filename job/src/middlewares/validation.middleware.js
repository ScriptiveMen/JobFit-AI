import { body, validationResult } from "express-validator";

async function validate(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    next();
}

export const jobUploadValidation = [
    body("title").isString().notEmpty().withMessage("Title cannot be empty"),
    body("description")
        .isString()
        .notEmpty()
        .withMessage("Description is required"),
    body("experienceLevel")
        .isIn(["fresher", "mid", "senior", "junior"])
        .withMessage("experience must be fresher, mid, senior, junior"),
    body("skillsRequired").isArray().withMessage("Skills required in array"),
    body("location").isString().withMessage("location must be a string"),
    body("salaryRange").isObject().withMessage("salary required in object"),

    validate,
];
