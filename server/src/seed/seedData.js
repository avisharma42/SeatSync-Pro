import dotenv from "dotenv";

import connectDB from "../config/db.js";
import { BATCH_A, BATCH_B, ROLE_ADMIN, ROLE_USER, SEAT_TYPE_FIXED, SEAT_TYPE_FLOATER } from "../config/constants.js";
import Holiday from "../models/Holiday.js";
import Seat from "../models/Seat.js";
import User from "../models/User.js";

dotenv.config();

const squads = Array.from({ length: 10 }, (_, index) => `SQ-${String(index + 1).padStart(2, "0")}`);

const buildUsers = () => {
    const users = [];

    users.push({
        name: "Admin User",
        email: "admin@org.com",
        password: "admin123",
        squadId: squads[0],
        batch: BATCH_A,
        role: ROLE_ADMIN
    });

    for (let i = 1; i <= 180; i += 1) {
        users.push({
            name: `Employee ${String(i).padStart(3, "0")}`,
            email: `employee${i}@org.com`,
            password: "password123",
            squadId: squads[(i - 1) % squads.length],
            batch: i % 2 === 0 ? BATCH_A : BATCH_B,
            role: ROLE_USER
        });
    }

    return users;
};

const buildSeats = () => {
    const fixed = Array.from({ length: 40 }, (_, index) => ({
        code: `F-${String(index + 1).padStart(2, "0")}`,
        type: SEAT_TYPE_FIXED
    }));

    const floater = Array.from({ length: 10 }, (_, index) => ({
        code: `FL-${String(index + 1).padStart(2, "0")}`,
        type: SEAT_TYPE_FLOATER
    }));

    return [...fixed, ...floater];
};

const seed = async () => {
    await connectDB();

    await Promise.all([User.deleteMany({}), Seat.deleteMany({}), Holiday.deleteMany({})]);

    await User.insertMany(buildUsers());
    await Seat.insertMany(buildSeats());

    console.log("Seed completed: users, seats, holidays reset");
    process.exit(0);
};

seed().catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
});
