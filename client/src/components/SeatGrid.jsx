import { motion } from "framer-motion";

const SeatGrid = ({ seats, onSelectSeat, isSeatSelectable = () => true, getSeatHint = () => "" }) => {
    return (
        <div className="grid grid-cols-5 gap-3 md:grid-cols-10">
            {seats.map((seat, index) => {
                const isBooked = seat.status === "booked";
                const isReleased = seat.status === "released";
                const isFloater = seat.type === "floater";
                const isAllowedByPolicy = isSeatSelectable(seat);
                const isDisabled = isBooked || !isAllowedByPolicy;

                const colors = isBooked
                    ? "border-red-300 bg-red-100 text-red-700"
                    : isReleased
                        ? "border-cyan-300 bg-cyan-100 text-cyan-800"
                        : isFloater
                            ? "border-amber-300 bg-amber-100 text-amber-700"
                            : "border-emerald-300 bg-emerald-100 text-emerald-700";

                const stateStyles = isDisabled
                    ? "cursor-not-allowed opacity-60"
                    : "hover:-translate-y-0.5";

                const hint = getSeatHint(seat);

                return (
                    <motion.button
                        key={seat._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.01 }}
                        disabled={isDisabled}
                        onClick={() => onSelectSeat(seat._id)}
                        title={hint}
                        className={`rounded-2xl border p-2 text-xs font-semibold shadow-soft transition ${colors} ${stateStyles}`}
                    >
                        <p>{seat.code}</p>
                        <p className="text-[10px] uppercase opacity-80">{isReleased ? "released" : seat.type}</p>
                    </motion.button>
                );
            })}
        </div>
    );
};

export default SeatGrid;
