import { isWeekend, parseISO } from "date-fns";
import mongoose from "mongoose";

import { BOOKING_STATUS_BOOKED, BOOKING_STATUS_CANCELLED, BOOKING_STATUS_LEAVE, ROLE_USER, SEAT_TYPE_FIXED } from "../config/constants.js";
import Booking from "../models/Booking.js";
import Holiday from "../models/Holiday.js";
import Seat from "../models/Seat.js";
import User from "../models/User.js";
import { getActiveBatchForDate, getAllowedSeatType } from "./scheduleService.js";
import { isPastDate, toDateKey } from "../utils/dateUtils.js";

const assertBookableDate = async (date) => {
    if (isPastDate(date)) {
        const error = new Error("Cannot book a seat for a past date");
        error.statusCode = 400;
        throw error;
    }

    if (isWeekend(parseISO(date))) {
        const error = new Error("Weekend booking is not allowed");
        error.statusCode = 400;
        throw error;
    }

    const holiday = await Holiday.findOne({ date });
    if (holiday) {
        const error = new Error("Booking on holidays is not allowed");
        error.statusCode = 400;
        throw error;
    }
};

const getSeatFilter = (allowedSeatType) => {
    if (allowedSeatType === "none") {
        throw new Error("No seats available for booking on this date. Check your batch assignment.");
    }
    if (allowedSeatType === "any") return {};
    return { type: allowedSeatType };
};

const getAssignedFixedSeatForUser = async (user) => {
    const usersInBatch = await User.find({ batch: user.batch, role: ROLE_USER })
        .sort({ createdAt: 1, _id: 1 })
        .select("_id")
        .lean();

    const position = usersInBatch.findIndex((item) => String(item._id) === String(user._id));
    if (position < 0) {
        return null;
    }

    const fixedSeatNumber = (position % 40) + 1;
    const seatCode = `F-${String(fixedSeatNumber).padStart(2, "0")}`;
    return Seat.findOne({ code: seatCode, type: SEAT_TYPE_FIXED });
};

const getReleasedFixedSeatIds = async (date, activeBatch) => {
    const activeBatchUsers = await User.find({ batch: activeBatch, role: ROLE_USER }).distinct("_id");

    const released = await Booking.find({
        date,
        status: BOOKING_STATUS_LEAVE,
        userId: { $in: activeBatchUsers }
    }).distinct("seatId");

    return released.map((id) => String(id));
};

export const createBooking = async ({ user, date, seatId }) => {
    const normalizedDate = toDateKey(date);
    await assertBookableDate(normalizedDate);

    const activeBatch = getActiveBatchForDate(normalizedDate);
    const normalizedUserBatch = user.batch === "A" ? "A" : "B";

    if (!activeBatch) {
        const error = new Error("No office booking is available on this date");
        error.statusCode = 400;
        throw error;
    }

    if (activeBatch === normalizedUserBatch) {
        const error = new Error("Your batch is on duty today. Fixed seats are assigned automatically.");
        error.statusCode = 400;
        throw error;
    }

    const releasedFixedSeatIds = await getReleasedFixedSeatIds(normalizedDate, activeBatch);

    const existingByUser = await Booking.findOne({
        userId: user._id,
        date: normalizedDate,
        status: BOOKING_STATUS_BOOKED
    });

    if (existingByUser) {
        const error = new Error("User already has a booking for this date");
        error.statusCode = 409;
        throw error;
    }

    const allowedSeatType = await getAllowedSeatType(user.batch, normalizedDate);

    let seat;
    if (seatId) {
        if (!mongoose.Types.ObjectId.isValid(seatId)) {
            const error = new Error("Invalid seatId");
            error.statusCode = 400;
            throw error;
        }

        seat = await Seat.findById(seatId);
        if (!seat) {
            const error = new Error("Seat not found");
            error.statusCode = 404;
            throw error;
        }

        if (seat.type === SEAT_TYPE_FIXED) {
            if (!releasedFixedSeatIds.includes(String(seat._id))) {
                const error = new Error("This fixed seat is not released by the working batch");
                error.statusCode = 400;
                throw error;
            }
        } else if (allowedSeatType !== "any" && seat.type !== allowedSeatType) {
            const error = new Error(`Seat type mismatch. Allowed: ${allowedSeatType}`);
            error.statusCode = 400;
            throw error;
        }

        const occupied = await Booking.findOne({
            seatId,
            date: normalizedDate,
            status: BOOKING_STATUS_BOOKED
        });

        if (occupied) {
            const error = new Error("Seat already booked for selected date");
            error.statusCode = 409;
            throw error;
        }
    } else {
        const occupiedSeatIds = await Booking.find({
            date: normalizedDate,
            status: BOOKING_STATUS_BOOKED
        }).distinct("seatId");

        seat = await Seat.findOne({
            $or: [
                getSeatFilter(allowedSeatType),
                { _id: { $in: releasedFixedSeatIds } }
            ],
            _id: { $nin: occupiedSeatIds }
        }).sort({ code: 1 });

        if (!seat) {
            const error = new Error("No seats available under current booking rules");
            error.statusCode = 409;
            throw error;
        }
    }

    const booking = await Booking.create({
        userId: user._id,
        seatId: seat._id,
        date: normalizedDate,
        status: BOOKING_STATUS_BOOKED
    });

    return booking.populate("seatId", "code type");
};

export const cancelBooking = async ({ user, bookingId }) => {
    const booking = await Booking.findOne({ _id: bookingId, userId: user._id });
    if (!booking) {
        const error = new Error("Booking not found");
        error.statusCode = 404;
        throw error;
    }

    booking.status = BOOKING_STATUS_CANCELLED;
    await booking.save();
    return booking;
};

export const markLeave = async ({ user, date }) => {
    const normalizedDate = toDateKey(date);
    await assertBookableDate(normalizedDate);

    const activeBatch = getActiveBatchForDate(normalizedDate);
    const normalizedUserBatch = user.batch === "A" ? "A" : "B";

    if (!activeBatch || activeBatch !== normalizedUserBatch) {
        const error = new Error("Leave can be marked only on your batch working day");
        error.statusCode = 400;
        throw error;
    }

    const fixedSeat = await getAssignedFixedSeatForUser(user);
    if (!fixedSeat) {
        const error = new Error("No fixed seat is mapped to your profile");
        error.statusCode = 400;
        throw error;
    }

    const existingLeave = await Booking.findOne({
        userId: user._id,
        date: normalizedDate,
        status: BOOKING_STATUS_LEAVE
    });

    if (existingLeave) {
        return { date: normalizedDate, released: true };
    }

    const booking = await Booking.findOne({
        userId: user._id,
        date: normalizedDate,
        status: BOOKING_STATUS_BOOKED
    });

    if (booking) {
        booking.status = BOOKING_STATUS_LEAVE;
        await booking.save();
        return { date: normalizedDate, released: true };
    }

    await Booking.create({
        userId: user._id,
        seatId: fixedSeat._id,
        date: normalizedDate,
        status: BOOKING_STATUS_LEAVE
    });

    return { date: normalizedDate, released: true };
};

export const getSeatAvailability = async (date) => {
    const normalizedDate = toDateKey(date);
    const seats = await Seat.find({}).sort({ code: 1 });
    const activeBatch = getActiveBatchForDate(normalizedDate);

    const releasedFixedSeatIds = activeBatch ? await getReleasedFixedSeatIds(normalizedDate, activeBatch) : [];

    const bookings = await Booking.find({
        date: normalizedDate,
        status: BOOKING_STATUS_BOOKED
    })
        .populate("userId", "name batch squadId")
        .lean();

    const bookedBySeat = new Map(bookings.map((item) => [String(item.seatId), item]));

    const mappedSeats = seats.map((seat) => {
        const booking = bookedBySeat.get(String(seat._id));
        const isReleasedFixedSeat = seat.type === SEAT_TYPE_FIXED && releasedFixedSeatIds.includes(String(seat._id));

        return {
            _id: seat._id,
            code: seat.code,
            type: seat.type,
            status: booking ? "booked" : isReleasedFixedSeat ? "released" : "available",
            bookedBy: booking ? booking.userId : null
        };
    });

    const floaterRemaining = mappedSeats.filter((seat) => seat.type === "floater" && seat.status === "available").length;

    return {
        date: normalizedDate,
        seats: mappedSeats,
        floaterRemaining,
        releasedFixedSeatIds
    };
};
