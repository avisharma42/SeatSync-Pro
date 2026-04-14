import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./config/db.js";
import { initializeSocket } from "./config/socket.js";
import { startReleaseSeatsJob } from "./jobs/releaseSeatsJob.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const bootstrap = async () => {
    await connectDB();

    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
        }
    });

    initializeSocket(io);
    startReleaseSeatsJob();

    httpServer.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

bootstrap().catch((error) => {
    console.error("Failed to bootstrap server", error);
    process.exit(1);
});
