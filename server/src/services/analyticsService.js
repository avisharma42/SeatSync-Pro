import Booking from "../models/Booking.js";
import Seat from "../models/Seat.js";

export const getUtilizationSummary = async ({ startDate, endDate }) => {
    const totalSeats = await Seat.countDocuments();

    const bookings = await Booking.aggregate([
        {
            $match: {
                date: { $gte: startDate, $lte: endDate },
                status: "booked"
            }
        },
        {
            $group: {
                _id: "$date",
                bookedSeats: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const daily = bookings.map((entry) => ({
        date: entry._id,
        bookedSeats: entry.bookedSeats,
        utilization: totalSeats ? Number(((entry.bookedSeats / totalSeats) * 100).toFixed(2)) : 0
    }));

    const totalBooked = daily.reduce((sum, day) => sum + day.bookedSeats, 0);
    const avgUtilization = daily.length
        ? Number((daily.reduce((sum, day) => sum + day.utilization, 0) / daily.length).toFixed(2))
        : 0;

    return {
        totalSeats,
        totalBooked,
        avgUtilization,
        daily
    };
};
