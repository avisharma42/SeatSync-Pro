import { motion, AnimatePresence } from "framer-motion";

import { useToast } from "../context/ToastContext";

const Toast = ({ toast, onClose }) => {
    const colors = {
        success: "bg-emerald-500",
        error: "bg-red-500",
        info: "bg-blue-500",
        warning: "bg-amber-500"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`rounded-2xl ${colors[toast.type] || colors.info} px-4 py-3 text-white shadow-glow`}
        >
            <p className="font-semibold">{toast.title}</p>
            {toast.message ? <p className="text-sm opacity-90">{toast.message}</p> : null}
        </motion.div>
    );
};

const ToastContainer = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed bottom-4 right-4 space-y-2 z-50 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <Toast toast={toast} onClose={() => removeToast(toast.id)} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
