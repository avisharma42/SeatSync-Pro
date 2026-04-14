import Booking from "../models/Booking.js";
import { emitSeatUpdate } from "../config/socket.js";
import { createBooking, cancelBooking, markLeave, getSeatAvailability } from "../services/bookingService.js";

export const createBookingHandler = async (req, res, next) => {
    try {
        const booking = await createBooking({
            user: req.user,
            date: req.body.date,
            seatId: req.body.seatId
        });

        emitSeatUpdate({
            date: booking.date,
            reason: "booking-created",
            payload: { bookingId: booking._id }
        });

        res.status(201).json({ booking });
    } catch (error) {
        next(error);
    }
};

export const cancelBookingHandler = async (req, res, next) => {
    try {
        const booking = await cancelBooking({ user: req.user, bookingId: req.params.id });
        emitSeatUpdate({
            date: booking.date,
            reason: "booking-cancelled",
            payload: { bookingId: booking._id }
        });
        res.json({ booking });
    } catch (error) {
        next(error);
    }
};

export const markLeaveHandler = async (req, res, next) => {
    try {
        const result = await markLeave({ user: req.user, date: req.body.date });
        if (result.released) {
            emitSeatUpdate({
                date: result.date,
                reason: "leave-marked"
            });
        }
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const listMyBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id })
            .populate("seatId", "code type")
            .sort({ date: 1 });

        res.json({ bookings });
    } catch (error) {
        next(error);
    }
};

export const availabilityHandler = async (req, res, next) => {
    try {
        const data = await getSeatAvailability(req.query.date || new Date());
        res.json(data);
    } catch (error) {
        next(error);
    }
};
