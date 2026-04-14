import { addDays, format, startOfWeek } from "date-fns";
import { motion } from "framer-motion";

const WeeklyCalendar = ({ selectedDate, onSelectDate, allowedDays = [] }) => {
    const anchor = startOfWeek(new Date(selectedDate), { weekStartsOn: 1 });
    const days = Array.from({ length: 5 }, (_, index) => addDays(anchor, index));

    return (
        <div className="grid grid-cols-5 gap-2">
            {days.map((day, index) => {
                const key = format(day, "yyyy-MM-dd");
                const active = key === selectedDate;
                const weekday = format(day, "EEEE");
                const isAllowed = allowedDays.includes(weekday);
                return (
                    <motion.button
                        key={key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onSelectDate(key, isAllowed)}
                        className={`rounded-2xl border p-3 text-left transition ${active
                            ? "border-ink bg-ink text-white shadow-soft"
                            : isAllowed
                                ? "border-white/50 bg-white/55 text-ink hover:-translate-y-0.5"
                                : "border-amber-200 bg-amber-50/90 text-amber-900 hover:-translate-y-0.5"
                            }`}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-xs uppercase tracking-wide opacity-80">{format(day, "EEE")}</p>
                                <p className="text-lg font-semibold">{format(day, "dd")}</p>
                            </div>
                            <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${active
                                        ? "bg-white/20 text-white"
                                        : isAllowed
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-amber-200 text-amber-800"
                                    }`}
                            >
                                {isAllowed ? "Allowed" : "Blocked"}
                            </span>
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
};

export default WeeklyCalendar;
