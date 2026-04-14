import { getDay } from "date-fns";

import { BATCH_A, BATCH_B, DAYS } from "../config/constants.js";
import { getCycleWeek, toDateKey } from "../utils/dateUtils.js";

const BATCH_RULES = {
    A: {
        1: [DAYS.MONDAY, DAYS.TUESDAY, DAYS.WEDNESDAY],
        2: [DAYS.THURSDAY, DAYS.FRIDAY]
    },
    B: {
        1: [DAYS.THURSDAY, DAYS.FRIDAY],
        2: [DAYS.MONDAY, DAYS.TUESDAY, DAYS.WEDNESDAY]
    }
};

export const isAssignedDay = (batch, date) => {
    const cycleStartDate = process.env.CYCLE_START_DATE || "2026-01-05";
    const cycleWeek = getCycleWeek(date, cycleStartDate);
    const weekday = getDay(new Date(date));
    const normalizedBatch = batch === BATCH_A ? "A" : "B";
    return BATCH_RULES[normalizedBatch][cycleWeek].includes(weekday);
};

export const getActiveBatchForDate = (date) => {
    if (isAssignedDay(BATCH_A, date)) {
        return BATCH_A;
    }

    if (isAssignedDay(BATCH_B, date)) {
        return BATCH_B;
    }

    return null;
};

export const getAllowedSeatType = async (batch, date) => {
    const activeBatch = getActiveBatchForDate(date);
    const normalizedBatch = batch === BATCH_A ? "A" : "B";

    if (!activeBatch || activeBatch === normalizedBatch) {
        return "none";
    }

    return "floater";
};

export const getBatchScheduleForWeek = (batch, weekNumber = 1) => {
    const normalizedBatch = batch === BATCH_A ? "A" : "B";
    return BATCH_RULES[normalizedBatch][weekNumber];
};
