import express from "express";

import { getSeats } from "../controllers/seatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getSeats);

export default router;
