import mongoose from "mongoose";

import {
    BOOKING_STATUS_BOOKED,
    BOOKING_STATUS_CANCELLED,
    BOOKING_STATUS_LEAVE,
    BOOKING_STATUS_RELEASED
} from "../config/constants.js";

const bookingSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        seatId: { type: mongoose.Schema.Types.ObjectId, ref: "Seat", required: true },
        date: { type: String, required: true },
        status: {
            type: String,
            enum: [BOOKING_STATUS_BOOKED, BOOKING_STATUS_CANCELLED, BOOKING_STATUS_LEAVE, BOOKING_STATUS_RELEASED],
            default: BOOKING_STATUS_BOOKED
        }
    },
    { timestamps: true }
);

bookingSchema.index(
    { seatId: 1, date: 1 },
    {
        unique: true,
        partialFilterExpression: { status: BOOKING_STATUS_BOOKED }
    }
);

bookingSchema.index(
    { userId: 1, date: 1 },
    {
        unique: true,
        partialFilterExpression: { status: BOOKING_STATUS_BOOKED }
    }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
