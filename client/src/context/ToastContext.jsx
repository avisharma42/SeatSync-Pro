import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ title, message, type = "info", duration = 4000 }) => {
        const id = ++toastId;

        setToasts((prev) => [
            ...prev,
            {
                id,
                title,
                message,
                type
            }
        ]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const value = useMemo(
        () => ({
            addToast,
            removeToast,
            toasts
        }),
        [addToast, removeToast, toasts]
    );

    return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used inside ToastProvider");
    return context;
};
