import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { BATCH_A, BATCH_B, ROLE_ADMIN, ROLE_USER } from "../config/constants.js";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, minlength: 6 },
        squadId: { type: String, required: true },
        batch: { type: String, enum: [BATCH_A, BATCH_B], required: true },
        role: { type: String, enum: [ROLE_USER, ROLE_ADMIN], default: ROLE_USER }
    },
    { timestamps: true }
);

userSchema.pre("save", async function handlePasswordHash(next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
    return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
