import { addDays, format, parseISO } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { getSocket } from "../api/socket";
import { adminApi, bookingApi } from "../api/services";
import AdminPanel from "../components/AdminPanel";
import GlassCard from "../components/GlassCard";
import SeatGrid from "../components/SeatGrid";
import WeeklyCalendar from "../components/WeeklyCalendar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const CYCLE_START_DATE = "2026-01-05";

const BATCH_ROTATION = {
    A: {
        title: "Batch 1",
        week1: ["Monday", "Tuesday", "Wednesday"],
        week2: ["Thursday", "Friday"]
    },
    B: {
        title: "Batch 2",
        week1: ["Thursday", "Friday"],
        week2: ["Monday", "Tuesday", "Wednesday"]
    }
};

const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const getCycleWeek = (date) => {
    const start = new Date(CYCLE_START_DATE);
    const target = new Date(date);
    const diffDays = Math.floor((target - start) / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7) % 2 === 0 ? 1 : 2;
};

const getAssignedOfficeDays = (batch, date) => {
    const normalizedBatch = batch === "A" ? "A" : "B";
    const cycleWeek = getCycleWeek(date);
    return BATCH_ROTATION[normalizedBatch][`week${cycleWeek}`];
};

const getBatchLabel = (batch) => BATCH_ROTATION[batch === "A" ? "A" : "B"].title;

const formatDateLabel = (date) => new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(new Date(date));

const DashboardPage = () => {
    const { user, logout } = useAuth();
    const { addToast } = useToast();
    const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [availability, setAvailability] = useState({ seats: [], floaterRemaining: 0, releasedFixedSeatIds: [] });
    const [bookings, setBookings] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [confirmDialog, setConfirmDialog] = useState(null);

    const loadData = async () => {
        setLoadError("");
        try {
            const [availabilityRes, bookingsRes] = await Promise.all([
                bookingApi.availability(selectedDate),
                bookingApi.myBookings()
            ]);

            setAvailability(availabilityRes.data);
            setBookings(bookingsRes.data.bookings);

            if (user.role === "admin") {
                const endDate = format(addDays(parseISO(selectedDate), 4), "yyyy-MM-dd");
                const analyticsRes = await adminApi.analytics(selectedDate, endDate);
                setAnalytics(analyticsRes.data);
            }
        } catch (_error) {
            setLoadError("Unable to load latest dashboard data. Please retry.");
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        setIsLoadingData(true);
        loadData();
        const timer = setInterval(loadData, 45000);
        return () => clearInterval(timer);
    }, [selectedDate]);

    useEffect(() => {
        const socket = getSocket();

        const handleSeatUpdate = (event) => {
            if (event?.date && event.date !== selectedDate) {
                return;
            }

            loadData();
            if (event?.reason) {
                const titles = {
                    "booking-created": "Booking Created",
                    "booking-cancelled": "Booking Cancelled",
                    "leave-marked": "Leave Marked",
                    "admin-force-release": "Seats Released",
                    "release-window-opened": "Release Window Opened"
                };
                addToast({
                    title: titles[event.reason] || "Seat Update",
                    message: `Updates available for ${event.date}`,
                    type: "info"
                });
            }
        };

        socket.emit("seats:watch", selectedDate);
        socket.on("seats:updated", handleSeatUpdate);

        return () => {
            socket.emit("seats:unwatch", selectedDate);
            socket.off("seats:updated", handleSeatUpdate);
        };
    }, [selectedDate]);

    const stats = useMemo(() => {
        const booked = availability.seats.filter((seat) => seat.status === "booked").length;
        const fixedAvailable = availability.seats.filter((seat) => seat.type === "fixed" && seat.status === "available").length;
        const reservedFixed = availability.seats.filter((seat) => seat.type === "fixed").length;
        const cycleWeek = getCycleWeek(selectedDate);
        const selectedWeekday = weekdayNames[new Date(selectedDate).getDay()];
        const assignedDays = getAssignedOfficeDays(user.batch, selectedDate);
        const isWorkingDayForUser = assignedDays.includes(selectedWeekday);
        const canBookSelectedDate = !isWorkingDayForUser;
        const otherBatchLabel = getBatchLabel(user.batch === "A" ? "B" : "A");

        return {
            booked,
            fixedAvailable,
            reservedFixed,
            floaterRemaining: availability.floaterRemaining,
            cycleWeek,
            selectedWeekday,
            assignedDays,
            isWorkingDayForUser,
            otherBatchLabel,
            canBookSelectedDate
        };
    }, [availability, selectedDate, user.batch]);

    const handleSelectDate = (date, isAllowed) => {
        setSelectedDate(date);
        if (!isAllowed) {
            const cycleWeek = getCycleWeek(date);
            const assignedDays = getAssignedOfficeDays(user.batch, date);
            addToast({
                title: "Working day selected",
                message: `${getBatchLabel(user.batch)} is on duty on ${assignedDays.join(", ")} in Week ${cycleWeek}. Fixed seats are assigned automatically on those days.`,
                type: "info"
            });
        }
    };

    const closeConfirmDialog = () => setConfirmDialog(null);

    const openConfirmDialog = (dialog) => setConfirmDialog(dialog);

    const runConfirmDialog = async () => {
        if (!confirmDialog?.onConfirm) {
            return;
        }

        const action = confirmDialog.onConfirm;
        closeConfirmDialog();
        await action();
    };

    const handleBook = (seatId) => {
        if (!stats.canBookSelectedDate) {
            addToast({
                title: "Fixed seats already assigned",
                message: `${getBatchLabel(user.batch)} is on duty for ${formatDateLabel(selectedDate)}. Fixed seats are assigned automatically; the other batch can book the floaters.`,
                type: "error"
            });
            return;
        }

        const seat = availability.seats.find((item) => item._id === seatId);
        if (!seat) {
            return;
        }

        const isReleasedFixedSeat = seat.type === "fixed" && availability.releasedFixedSeatIds.includes(String(seat._id));

        if (seat.type !== "floater" && !isReleasedFixedSeat) {
            addToast({
                title: "Seat type not allowed",
                message: "Only floater seats and released fixed seats are bookable on off-duty days.",
                type: "error"
            });
            return;
        }

        openConfirmDialog({
            title: "Confirm seat booking",
            description: "Review the seat details before you finalize this booking.",
            confirmLabel: "Confirm booking",
            tone: "booking",
            details: [
                { label: "Date", value: selectedDate },
                { label: "Seat", value: seat.code },
                { label: "Seat type", value: seat.type },
                { label: "Current status", value: seat.status }
            ],
            onConfirm: async () => {
                try {
                    const { data } = await bookingApi.create({ date: selectedDate, seatId });
                    addToast({
                        title: "Booking Confirmed",
                        message: `Seat ${data.booking.seatId.code} booked for ${selectedDate}`,
                        type: "success"
                    });
                    loadData();
                } catch (err) {
                    addToast({
                        title: "Booking Failed",
                        message: err.response?.data?.message || "Unable to book seat",
                        type: "error"
                    });
                }
            }
        });
    };

    const handleAutoBook = () => {
        if (!stats.canBookSelectedDate) {
            addToast({
                title: "No booking required",
                message: `${getBatchLabel(user.batch)} is on duty today. Fixed seats are assigned automatically, so booking is not needed for ${formatDateLabel(selectedDate)}.`,
                type: "error"
            });
            return;
        }

        openConfirmDialog({
            title: "Confirm auto allocation",
            description: "SeatSync Pro will automatically choose one of the available floater seats for the off-duty batch.",
            confirmLabel: "Allocate seat",
            tone: "neutral",
            details: [
                { label: "Date", value: selectedDate },
                { label: "Mode", value: `Floater booking for ${stats.otherBatchLabel}` },
                { label: "Floater seats left", value: String(stats.floaterRemaining) }
            ],
            onConfirm: async () => {
                try {
                    await bookingApi.create({ date: selectedDate });
                    addToast({
                        title: "Auto-Allocation Complete",
                        message: `Seat automatically assigned for ${selectedDate}`,
                        type: "success"
                    });
                    loadData();
                } catch (err) {
                    addToast({
                        title: "Auto-Allocation Failed",
                        message: err.response?.data?.message || "No seats available",
                        type: "error"
                    });
                }
            }
        });
    };

    const handleTomorrowLeave = () => {
        const tomorrow = format(addDays(parseISO(selectedDate), 1), "yyyy-MM-dd");
        openConfirmDialog({
            title: "Mark tomorrow absent?",
            description: "Your fixed seat for tomorrow will be released for the other batch.",
            confirmLabel: "Mark absent",
            tone: "warning",
            details: [
                { label: "Date", value: tomorrow },
                { label: "Impact", value: "Releases your fixed seat" },
                { label: "Who can book", value: "Other batch members" }
            ],
            onConfirm: async () => {
                try {
                    await bookingApi.leave(tomorrow);
                    addToast({
                        title: "Tomorrow marked absent",
                        message: `Your fixed seat is released for ${tomorrow}.`,
                        type: "success"
                    });
                    loadData();
                } catch (err) {
                    addToast({
                        title: "Unable to mark absent",
                        message: err.response?.data?.message || "Failed to mark tomorrow absent",
                        type: "error"
                    });
                }
            }
        });
    };

    const cancelBooking = (booking) => {
        openConfirmDialog({
            title: "Cancel booking?",
            description: "Please confirm the booking details below before cancelling.",
            confirmLabel: "Cancel booking",
            tone: "danger",
            details: [
                { label: "Date", value: booking.date },
                { label: "Seat", value: booking.seatId?.code || "Unknown" },
                { label: "Status", value: booking.status }
            ],
            onConfirm: async () => {
                try {
                    await bookingApi.cancel(booking._id);
                    addToast({
                        title: "Booking Cancelled",
                        message: "Your seat booking has been cancelled",
                        type: "success"
                    });
                    loadData();
                } catch (err) {
                    addToast({
                        title: "Cancellation Failed",
                        message: "Unable to cancel booking",
                        type: "error"
                    });
                }
            }
        });
    };

    return (
        <main className="bg-pattern min-h-screen flex flex-col text-ink">
            {/* Sticky Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="sticky top-0 z-40 border-b border-white/20 bg-white/70 shadow-lg backdrop-blur-xl"
            >
                <div className="mx-auto max-w-7xl px-4 py-4 md:px-8 md:py-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Flight-style Operations</p>
                            <h1 className="font-display text-3xl font-bold text-ink mt-1">Seat Booking Dashboard</h1>
                            <p className="text-sm text-slate-600 mt-1">
                                Welcome, {user.name} • Batch {user.batch} • Squad {user.squadId}
                            </p>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            <button onClick={handleAutoBook} className="rounded-xl bg-ink hover:bg-ink/90 px-4 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all">
                                Auto Allocate
                            </button>
                            <button onClick={handleTomorrowLeave} className="rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-800 transition-all">
                                Mark Tomorrow Absent
                            </button>
                            <button
                                onClick={logout}
                                className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-all"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8 md:py-10 scroll-smooth">
                <div className="mx-auto max-w-7xl space-y-8">
                    {/* Booking Grid */}
                    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                        {/* Main Booking Area */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <GlassCard className="space-y-6">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <WeeklyCalendar selectedDate={selectedDate} onSelectDate={handleSelectDate} allowedDays={stats.assignedDays} />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className={`rounded-2xl border p-6 backdrop-blur-sm transition-all ${stats.canBookSelectedDate
                                        ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-50/50"
                                        : "border-amber-200 bg-gradient-to-br from-amber-50 to-amber-50/50"
                                        }`}
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Batch Rotation Policy</p>
                                            <h2 className="mt-2 font-display text-2xl font-bold text-ink">Fixed seats belong to the batch on duty</h2>
                                            <p className="mt-2 text-sm text-slate-600">
                                                Your batch gets the fixed 40 automatically on working days. The other batch can book from the 10 floater seats.
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 whitespace-nowrap shadow-sm">
                                            {formatDateLabel(selectedDate)}
                                        </div>
                                    </div>

                                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                                        <motion.div
                                            whileHover={{ y: -3 }}
                                            className="rounded-xl border border-emerald-200/50 bg-white/90 p-4 shadow-sm hover:shadow-md transition-all"
                                        >
                                            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Batch 1</p>
                                            <p className="mt-2 text-sm font-semibold text-slate-900">Week 1: Monday—Wednesday</p>
                                            <p className="text-sm text-slate-600">Week 2: Thursday—Friday</p>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ y: -3 }}
                                            className="rounded-xl border border-amber-200/50 bg-white/90 p-4 shadow-sm hover:shadow-md transition-all"
                                        >
                                            <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Batch 2</p>
                                            <p className="mt-2 text-sm font-semibold text-slate-900">Week 1: Thursday—Friday</p>
                                            <p className="text-sm text-slate-600">Week 2: Monday—Wednesday</p>
                                        </motion.div>
                                    </div>

                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="mt-5 rounded-xl border border-slate-200 bg-white/90 p-4 text-sm shadow-sm"
                                    >
                                        <p className="font-semibold text-ink">Your Schedule: {getBatchLabel(user.batch)} • Week {stats.cycleWeek}</p>
                                        <p className="mt-2 text-slate-700">
                                            {stats.isWorkingDayForUser ? (
                                                <span>Today is your working day. Fixed seats are assigned automatically.</span>
                                            ) : (
                                                <span>Your batch is at home today. You can book from the remaining floater seats.</span>
                                            )}
                                        </p>
                                        <p className="mt-2 text-xs text-slate-500">
                                            {stats.isWorkingDayForUser
                                                ? "Your office seat is already assigned for this date."
                                                : `The other batch is on duty, so only the floater seats are open for ${getBatchLabel(user.batch)}.`}
                                        </p>
                                    </motion.div>
                                </motion.div>

                                {loadError ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700 font-medium shadow-sm"
                                        role="alert"
                                    >
                                        ⚠️ {loadError}
                                    </motion.div>
                                ) : null}

                                {isLoadingData ? (
                                    <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 text-center shadow-sm" role="status" aria-live="polite">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                            className="w-6 h-6 border-3 border-slate-300 border-t-ink rounded-full mx-auto"
                                        />
                                        <p className="mt-3 text-sm text-slate-600 font-medium">Loading seat availability...</p>
                                    </div>
                                ) : null}

                                {/* Stats Cards */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 }}
                                    className="grid grid-cols-3 gap-4"
                                >
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        className="rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-100/60 p-5 text-emerald-900 shadow-md hover:shadow-lg transition-all border border-emerald-200/50"
                                    >
                                        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Fixed Reserved</p>
                                        <p className="text-3xl font-bold mt-3">{stats.reservedFixed}</p>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        className="rounded-2xl bg-gradient-to-br from-amber-100 to-amber-100/60 p-5 text-amber-900 shadow-md hover:shadow-lg transition-all border border-amber-200/50"
                                    >
                                        <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Floater Remaining</p>
                                        <p className="text-3xl font-bold mt-3">{stats.floaterRemaining}</p>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ y: -4 }}
                                        className="rounded-2xl bg-gradient-to-br from-red-100 to-red-100/60 p-5 text-red-900 shadow-md hover:shadow-lg transition-all border border-red-200/50"
                                    >
                                        <p className="text-xs font-bold uppercase tracking-wide text-red-700">Booked</p>
                                        <p className="text-3xl font-bold mt-3">{stats.booked}</p>
                                    </motion.div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs font-medium text-slate-700 shadow-sm"
                                >
                                    {stats.canBookSelectedDate
                                        ? `✓ Booking open: floaters and ${availability.releasedFixedSeatIds.length} released fixed seat(s) are available for ${getBatchLabel(user.batch)}.`
                                        : `⊘ Fixed seats are assigned automatically to your batch for this day. Released today: ${availability.releasedFixedSeatIds.length}.`}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.45 }}
                                >
                                    <SeatGrid
                                        seats={availability.seats}
                                        onSelectSeat={handleBook}
                                        isSeatSelectable={(seat) => {
                                            if (!stats.canBookSelectedDate) {
                                                return false;
                                            }
                                            if (seat.type === "floater") {
                                                return true;
                                            }
                                            return availability.releasedFixedSeatIds.includes(String(seat._id));
                                        }}
                                        getSeatHint={(seat) => {
                                            if (seat.status === "booked") {
                                                return "Already booked";
                                            }
                                            if (seat.status === "released") {
                                                return "Released fixed seat due to leave";
                                            }
                                            if (!stats.canBookSelectedDate) {
                                                return "Fixed seats assigned to your batch today";
                                            }
                                            if (seat.type !== "floater") {
                                                if (availability.releasedFixedSeatIds.includes(String(seat._id))) {
                                                    return "Released fixed seat - click to book";
                                                }
                                                return "Fixed seat not released by the working batch";
                                            }
                                            return `Floater seat open for ${getBatchLabel(user.batch)}`;
                                        }}
                                    />
                                </motion.div>
                            </GlassCard>
                        </motion.div>

                        {/* Right Sidebar - My Bookings */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <GlassCard className="sticky top-24 space-y-4">
                                <div>
                                    <h3 className="font-display text-xl font-bold text-ink">My Bookings</h3>
                                    <p className="text-xs text-slate-500 mt-1 font-medium">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>
                                </div>
                                <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1 scroll-smooth">
                                    {!isLoadingData && bookings.length === 0 ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-50/50 p-5 text-center text-sm shadow-sm"
                                        >
                                            <p className="font-semibold text-slate-800">No bookings yet</p>
                                            <p className="text-xs text-slate-600 mt-1.5">Select a seat or use Auto Allocate</p>
                                        </motion.div>
                                    ) : null}
                                    {bookings.map((booking, idx) => (
                                        <motion.div
                                            key={booking._id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            whileHover={{ x: 4 }}
                                            className="rounded-xl border border-slate-200/70 bg-white/90 hover:bg-white p-4 shadow-sm hover:shadow-md transition-all"
                                        >
                                            <p className="text-sm font-bold text-ink">
                                                {booking.date} • <span className="text-emerald-700">{booking.seatId?.code}</span>
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">{booking.status}</p>
                                            {booking.status === "booked" ? (
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => cancelBooking(booking)}
                                                    className="mt-3 w-full rounded-lg bg-red-500 hover:bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-md hover:shadow-lg transition-all"
                                                >
                                                    Cancel Booking
                                                </motion.button>
                                            ) : null}
                                        </motion.div>
                                    ))}
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>

                    {user.role === "admin" ? <AdminPanel /> : null}

                    {analytics ? (
                        <GlassCard>
                            <h3 className="font-display text-lg">Seat Utilization Analytics</h3>
                            <p className="text-sm text-slate-600">Average utilization: {analytics.avgUtilization}%</p>
                        </GlassCard>
                    ) : null}

                    {confirmDialog ? (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
                            role="presentation"
                            onClick={closeConfirmDialog}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                onClick={(event) => event.stopPropagation()}
                                className="w-full max-w-lg rounded-3xl border border-white/60 bg-white p-8 shadow-2xl"
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="confirm-dialog-title"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Please confirm</p>
                                        <h3 id="confirm-dialog-title" className="mt-2 font-display text-2xl font-bold text-ink">
                                            {confirmDialog.title}
                                        </h3>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: 0.92 }}
                                        type="button"
                                        onClick={closeConfirmDialog}
                                        className="rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 transition-all"
                                        aria-label="Close confirmation dialog"
                                    >
                                        ×
                                    </motion.button>
                                </div>

                                <p className="mt-4 text-sm text-slate-700 leading-relaxed">{confirmDialog.description}</p>

                                <div className="mt-6 grid gap-2 rounded-2xl border border-slate-200 bg-slate-50/90 p-5 text-sm">
                                    {confirmDialog.details.map((item) => (
                                        <div key={item.label} className="flex items-center justify-between gap-3 py-1">
                                            <span className="text-slate-600 font-medium">{item.label}</span>
                                            <span className="font-semibold text-slate-900">{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 flex flex-wrap justify-end gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="button"
                                        onClick={closeConfirmDialog}
                                        className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all shadow-sm"
                                    >
                                        Go Back
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="button"
                                        onClick={runConfirmDialog}
                                        className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all ${confirmDialog.tone === "danger"
                                            ? "bg-red-600 hover:bg-red-700"
                                            : confirmDialog.tone === "warning"
                                                ? "bg-coral hover:bg-coral/90"
                                                : confirmDialog.tone === "booking"
                                                    ? "bg-ink hover:bg-ink/90"
                                                    : "bg-slate-900 hover:bg-slate-800"
                                            }`}
                                    >
                                        {confirmDialog.confirmLabel}
                                    </motion.button>
                                </div>
                            </motion.div>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-white/20 bg-gradient-to-b from-white/50 to-white/30 backdrop-blur-lg mt-auto">
                <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
                    <div className="grid gap-8 md:grid-cols-4">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                        >
                            <h4 className="font-display text-lg font-bold text-ink">SeatSync Pro</h4>
                            <p className="mt-2 text-sm text-slate-600">Professional seat booking and office management system built for modern teams.</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            viewport={{ once: true }}
                        >
                            <h5 className="text-xs font-bold uppercase tracking-wide text-slate-700">Product</h5>
                            <ul className="mt-3 space-y-2 text-sm text-slate-600">
                                <li><a href="#" className="hover:text-ink transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-ink transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-ink transition-colors">Security</a></li>
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            <h5 className="text-xs font-bold uppercase tracking-wide text-slate-700">Company</h5>
                            <ul className="mt-3 space-y-2 text-sm text-slate-600">
                                <li><a href="#" className="hover:text-ink transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-ink transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-ink transition-colors">Contact</a></li>
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            viewport={{ once: true }}
                        >
                            <h5 className="text-xs font-bold uppercase tracking-wide text-slate-700">Legal</h5>
                            <ul className="mt-3 space-y-2 text-sm text-slate-600">
                                <li><a href="#" className="hover:text-ink transition-colors">Privacy</a></li>
                                <li><a href="#" className="hover:text-ink transition-colors">Terms</a></li>
                                <li><a href="#" className="hover:text-ink transition-colors">Cookies</a></li>
                            </ul>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        viewport={{ once: true }}
                        className="mt-8 border-t border-white/20 pt-8 text-center"
                    >
                        <p className="text-xs font-medium text-slate-600">
                            © {new Date().getFullYear()} SeatSync Pro. All rights reserved. • Engineered with passion for seamless office coordination.
                        </p>
                    </motion.div>
                </div>
            </footer>
        </main>
    );
};

export default DashboardPage;
