import Seat from "../models/Seat.js";

export const getSeats = async (_req, res, next) => {
    try {
        const seats = await Seat.find({}).sort({ code: 1 });
        res.json({ seats });
    } catch (error) {
        next(error);
    }
};
