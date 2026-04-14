import mongoose from "mongoose";

import { SEAT_TYPE_FIXED, SEAT_TYPE_FLOATER } from "../config/constants.js";

const seatSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true },
        type: { type: String, enum: [SEAT_TYPE_FIXED, SEAT_TYPE_FLOATER], required: true }
    },
    { timestamps: true }
);

const Seat = mongoose.model("Seat", seatSchema);

export default Seat;
