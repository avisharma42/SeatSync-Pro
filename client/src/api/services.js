import api from "./client";

export const authApi = {
    register: (payload) => api.post("/auth/register", payload),
    login: (payload) => api.post("/auth/login", payload),
    me: () => api.get("/auth/me")
};

export const bookingApi = {
    myBookings: () => api.get("/bookings/me"),
    availability: (date) => api.get("/bookings/availability", { params: { date } }),
    create: (payload) => api.post("/bookings", payload),
    cancel: (id) => api.patch(`/bookings/${id}/cancel`),
    leave: (date) => api.post("/bookings/leave", { date })
};

export const adminApi = {
    users: () => api.get("/admin/users"),
    addHoliday: (payload) => api.post("/admin/holidays", payload),
    holidays: () => api.get("/admin/holidays"),
    analytics: (startDate, endDate) => api.get("/admin/analytics/utilization", { params: { startDate, endDate } }),
    forceRelease: (date) => api.post("/admin/force-release", { date })
};
