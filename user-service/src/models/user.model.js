import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            firstName: {
                type: String,
                required: true,
            },

            lastName: {
                type: String,
                required: true,
            },
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: function () {
                !this.googleId;
            },
        },
        role: {
            type: String,
            enum: ["candidate", "recruiter"],
            required: true,
        },

        googleId: {
            type: String,
        },
    },
    { timestamps: true }
);

const userModel = mongoose.model("user", userSchema);

export default userModel;
