let ioInstance;

const dateRoom = (date) => `date:${date}`;

export const initializeSocket = (io) => {
    ioInstance = io;

    io.on("connection", (socket) => {
        socket.on("seats:watch", (date) => {
            if (date) {
                socket.join(dateRoom(date));
            }
        });

        socket.on("seats:unwatch", (date) => {
            if (date) {
                socket.leave(dateRoom(date));
            }
        });
    });
};

export const emitSeatUpdate = ({ date, reason, payload } = {}) => {
    if (!ioInstance) return;

    const event = {
        date,
        reason: reason || "seat-state-changed",
        payload: payload || null,
        emittedAt: new Date().toISOString()
    };

    if (date) {
        ioInstance.to(dateRoom(date)).emit("seats:updated", event);
        return;
    }

    ioInstance.emit("seats:updated", event);
};
