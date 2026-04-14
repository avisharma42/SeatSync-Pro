import Booking from "../models/Booking.js";
import { emitSeatUpdate } from "../config/socket.js";
import Holiday from "../models/Holiday.js";
import Seat from "../models/Seat.js";
import User from "../models/User.js";
import { getUtilizationSummary } from "../services/analyticsService.js";
import { toDateKey } from "../utils/dateUtils.js";

export const listUsers = async (_req, res, next) => {
    try {
        const users = await User.find({}).select("-password").sort({ name: 1 });
        res.json({ users });
    } catch (error) {
        next(error);
    }
};

export const createUser = async (req, res, next) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json({ user });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
        if (!user) {
            const err = new Error("User not found");
            err.statusCode = 404;
            throw err;
        }

        res.json({ user });
    } catch (error) {
        next(error);
    }
};

export const addHoliday = async (req, res, next) => {
    try {
        const holiday = await Holiday.create({
            date: toDateKey(req.body.date),
            title: req.body.title
        });
        res.status(201).json({ holiday });
    } catch (error) {
        next(error);
    }
};

export const listHolidays = async (_req, res, next) => {
    try {
        const holidays = await Holiday.find({}).sort({ date: 1 });
        res.json({ holidays });
    } catch (error) {
        next(error);
    }
};

export const forceReleaseBookings = async (req, res, next) => {
    try {
        const date = toDateKey(req.body.date);
        const result = await Booking.updateMany(
            { date, status: "booked" },
            { $set: { status: "released" } }
        );

        if (result.modifiedCount > 0) {
            emitSeatUpdate({
                date,
                reason: "admin-force-release",
                payload: { releasedCount: result.modifiedCount }
            });
        }

        res.json({
            date,
            releasedCount: result.modifiedCount
        });
    } catch (error) {
        next(error);
    }
};

export const utilizationAnalytics = async (req, res, next) => {
    try {
        const startDate = req.query.startDate || toDateKey(new Date());
        const endDate = req.query.endDate || startDate;
        const data = await getUtilizationSummary({ startDate, endDate });

        const seats = await Seat.aggregate([
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({ ...data, seatsByType: seats });
    } catch (error) {
        next(error);
    }
};
