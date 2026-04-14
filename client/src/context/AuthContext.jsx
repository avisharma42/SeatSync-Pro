import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { authApi } from "../api/services";

const AuthContext = createContext(null);

const normalizeWorkEmail = (value) => value.trim().toLowerCase();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const hydrate = async () => {
            const token = localStorage.getItem("seat_token");
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const { data } = await authApi.me();
                setUser(data.user);
            } catch (_error) {
                localStorage.removeItem("seat_token");
            } finally {
                setLoading(false);
            }
        };

        hydrate();
    }, []);

    const register = async (email, password, name, squadId, batch) => {
        const normalizedEmail = normalizeWorkEmail(email);
        const { data } = await authApi.register({ email: normalizedEmail, password, name, squadId, batch });
        localStorage.setItem("seat_token", data.token);
        setUser(data.user);
    };

    const login = async (email, password) => {
        const normalizedEmail = normalizeWorkEmail(email);
        const { data } = await authApi.login({ email: normalizedEmail, password });
        localStorage.setItem("seat_token", data.token);
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem("seat_token");
        setUser(null);
    };

    const value = useMemo(
        () => ({
            user,
            loading,
            register,
            login,
            logout
        }),
        [user, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
};
