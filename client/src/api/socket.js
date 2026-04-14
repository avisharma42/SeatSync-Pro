import { io } from "socket.io-client";

let socketInstance;

export const getSocket = () => {
    if (socketInstance) return socketInstance;

    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const socketBase = apiBase.replace(/\/api\/?$/, "");

    socketInstance = io(socketBase, {
        transports: ["websocket"]
    });

    return socketInstance;
};
