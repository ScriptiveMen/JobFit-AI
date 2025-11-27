import { body, validationResult } from "express-validator";

async function validate(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    next();
}

export const registerUserValidation = [
    // base user fields
    body("email").isEmail().withMessage("Invalid email"),
    body("role")
        .isIn(["candidate", "recruiter"])
        .withMessage("Role must be either candidate or recruiter"),

    // candidate fields
    body("fullName.firstName").notEmpty().withMessage("firstname is required"),

    body("preferredRole")
        .if(body("role").equals("candidate"))
        .isString()
        .notEmpty()
        .withMessage("preferred role is required"),

    body("skills")
        .if(body("role").equals("candidate"))
        .isArray()
        .withMessage("Skills must be a array"),

    // recruiter fields
    body("website")
        .if(body("role").equals("recruiter"))
        .isURL()
        .withMessage("valid website is required"),

    body("contactNumber")
        .if(body("role").equals("recruiter"))
        .isString()
        .withMessage("contact number must be a string"),

    validate,
];

export const loginUserValidation = [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("password is required"),
];
