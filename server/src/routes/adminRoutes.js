import express from "express";

import {
    addHoliday,
    createUser,
    forceReleaseBookings,
    listHolidays,
    listUsers,
    updateUser,
    utilizationAnalytics
} from "../controllers/adminController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/users", listUsers);
router.post("/users", createUser);
router.patch("/users/:id", updateUser);
router.get("/holidays", listHolidays);
router.post("/holidays", addHoliday);
router.post("/force-release", forceReleaseBookings);
router.get("/analytics/utilization", utilizationAnalytics);

export default router;
