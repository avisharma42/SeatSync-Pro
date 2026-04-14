import cron from "node-cron";

import { emitSeatUpdate } from "../config/socket.js";
import ReleaseWindow from "../models/ReleaseWindow.js";
import { getNextWorkingDay, toDateKey } from "../utils/dateUtils.js";

export const startReleaseSeatsJob = () => {
    cron.schedule("0 15 * * 1-5", async () => {
        const nextWorkingDay = getNextWorkingDay(new Date());
        const date = toDateKey(nextWorkingDay);

        await ReleaseWindow.findOneAndUpdate(
            { date },
            { $set: { date, releasedAt: new Date() } },
            { upsert: true, new: true }
        );

        emitSeatUpdate({
            date,
            reason: "release-window-opened"
        });

        console.log(`3 PM release window opened for ${date}`);
    });
};
