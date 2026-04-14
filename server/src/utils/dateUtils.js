import { addDays, differenceInCalendarWeeks, format, isWeekend, parseISO, startOfDay } from "date-fns";

export const normalizeDate = (value) => {
    const date = typeof value === "string" ? parseISO(value) : new Date(value);
    return startOfDay(date);
};

export const toDateKey = (value) => format(normalizeDate(value), "yyyy-MM-dd");

export const isPastDate = (value) => normalizeDate(value) < startOfDay(new Date());

export const getCycleWeek = (date, cycleStartDate) => {
    const current = normalizeDate(date);
    const start = normalizeDate(cycleStartDate);
    const diffWeeks = differenceInCalendarWeeks(current, start, { weekStartsOn: 1 });
    return Math.abs(diffWeeks % 2) === 0 ? 1 : 2;
};

export const getNextWorkingDay = (fromDate = new Date()) => {
    let cursor = addDays(startOfDay(fromDate), 1);
    while (isWeekend(cursor)) {
        cursor = addDays(cursor, 1);
    }
    return cursor;
};
