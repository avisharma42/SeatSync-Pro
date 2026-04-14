import express from "express";

import {
    availabilityHandler,
    cancelBookingHandler,
    createBookingHandler,
    listMyBookings,
    markLeaveHandler
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/me", listMyBookings);
router.get("/availability", availabilityHandler);
router.post("/", createBookingHandler);
router.patch("/:id/cancel", cancelBookingHandler);
router.post("/leave", markLeaveHandler);

export default router;
