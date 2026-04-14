import jwt from "jsonwebtoken";

import User from "../models/User.js";

const normalizeWorkEmail = (value) => value.trim().toLowerCase();

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });

export const register = async (req, res, next) => {
    try {
        const { name, email, password, squadId, batch, role } = req.body;
        const normalizedEmail = normalizeWorkEmail(email);

        const exists = await User.findOne({ email: normalizedEmail });
        if (exists) {
            const error = new Error("Email already exists");
            error.statusCode = 409;
            throw error;
        }

        const user = await User.create({ name, email: normalizedEmail, password, squadId, batch, role });

        res.status(201).json({
            token: signToken(user._id),
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                squadId: user.squadId,
                batch: user.batch,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = normalizeWorkEmail(email);
        const user = await User.findOne({ email: normalizedEmail });

        if (!user || !(await user.comparePassword(password))) {
            const error = new Error("Invalid credentials");
            error.statusCode = 401;
            throw error;
        }

        res.json({
            token: signToken(user._id),
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                squadId: user.squadId,
                batch: user.batch,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

export const me = async (req, res) => {
    res.json({ user: req.user });
};
