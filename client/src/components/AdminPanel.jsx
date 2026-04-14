import { useState } from "react";
import { motion } from "framer-motion";

import { adminApi } from "../api/services";
import { useToast } from "../context/ToastContext";
import GlassCard from "./GlassCard";

const AdminPanel = () => {
    const { addToast } = useToast();
    const [holidayDate, setHolidayDate] = useState("");
    const [holidayTitle, setHolidayTitle] = useState("");
    const [forceDate, setForceDate] = useState("");
    const [confirmDialog, setConfirmDialog] = useState(null);

    const closeConfirmDialog = () => setConfirmDialog(null);

    const openConfirmDialog = (dialog) => setConfirmDialog(dialog);

    const runConfirmDialog = async () => {
        if (!confirmDialog?.onConfirm) {
            return;
        }

        const action = confirmDialog.onConfirm;
        closeConfirmDialog();
        await action();
    };

    const addHoliday = () => {
        openConfirmDialog({
            title: "Confirm holiday entry",
            description: "Review the holiday date and title before saving it for all users.",
            confirmLabel: "Add holiday",
            tone: "booking",
            details: [
                { label: "Date", value: holidayDate || "Not selected" },
                { label: "Title", value: holidayTitle || "Holiday" },
                { label: "Scope", value: "All booking access will be blocked" }
            ],
            onConfirm: async () => {
                try {
                    await adminApi.addHoliday({ date: holidayDate, title: holidayTitle || "Holiday" });
                    addToast({
                        title: "Holiday Added",
                        message: `${holidayTitle || "Holiday"} marked for ${holidayDate}`,
                        type: "success"
                    });
                    setHolidayDate("");
                    setHolidayTitle("");
                } catch (err) {
                    addToast({
                        title: "Failed to Add Holiday",
                        message: err.response?.data?.message || "Error occurred",
                        type: "error"
                    });
                }
            }
        });
    };

    const forceRelease = () => {
        openConfirmDialog({
            title: "Confirm force release",
            description: "This will release all bookings for the selected date. Please confirm carefully.",
            confirmLabel: "Force release",
            tone: "danger",
            details: [
                { label: "Date", value: forceDate || "Not selected" },
                { label: "Impact", value: "All bookings will be released" },
                { label: "Warning", value: "This cannot be undone" }
            ],
            onConfirm: async () => {
                try {
                    const { data } = await adminApi.forceRelease(forceDate);
                    addToast({
                        title: "Seats Released",
                        message: `${data.releasedCount} bookings released for ${data.date}`,
                        type: "success"
                    });
                    setForceDate("");
                } catch (err) {
                    addToast({
                        title: "Force Release Failed",
                        message: err.response?.data?.message || "Error occurred",
                        type: "error"
                    });
                }
            }
        });
    };

    return (
        <GlassCard>
            <h3 className="font-display text-lg">Admin Controls</h3>
            <div className="mt-3 grid gap-3">
                <div className="grid gap-2 md:grid-cols-3">
                    <input
                        type="date"
                        className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2"
                        value={holidayDate}
                        onChange={(event) => setHolidayDate(event.target.value)}
                    />
                    <input
                        placeholder="Holiday title"
                        className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2"
                        value={holidayTitle}
                        onChange={(event) => setHolidayTitle(event.target.value)}
                    />
                    <button
                        onClick={addHoliday}
                        className="rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-white"
                    >
                        Mark Holiday
                    </button>
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                    <input
                        type="date"
                        className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2"
                        value={forceDate}
                        onChange={(event) => setForceDate(event.target.value)}
                    />
                    <button
                        onClick={forceRelease}
                        className="rounded-xl bg-coral px-3 py-2 text-sm font-semibold text-white"
                    >
                        Force Release Bookings
                    </button>
                </div>
            </div>

            {confirmDialog ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4"
                    role="presentation"
                    onClick={closeConfirmDialog}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        onClick={(event) => event.stopPropagation()}
                        className="w-full max-w-md rounded-3xl border border-white/60 bg-white p-6 shadow-glow"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="admin-confirm-dialog-title"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Please confirm</p>
                                <h4 id="admin-confirm-dialog-title" className="mt-1 font-display text-xl text-ink">
                                    {confirmDialog.title}
                                </h4>
                            </div>
                            <button
                                type="button"
                                onClick={closeConfirmDialog}
                                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-600"
                                aria-label="Close confirmation dialog"
                            >
                                Close
                            </button>
                        </div>

                        <p className="mt-3 text-sm text-slate-600">{confirmDialog.description}</p>

                        <div className="mt-5 grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                            {confirmDialog.details.map((item) => (
                                <div key={item.label} className="flex items-center justify-between gap-3">
                                    <span className="text-slate-500">{item.label}</span>
                                    <span className="font-semibold text-slate-800">{item.value}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex flex-wrap justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeConfirmDialog}
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                            >
                                Go Back
                            </button>
                            <button
                                type="button"
                                onClick={runConfirmDialog}
                                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${confirmDialog.tone === "danger" ? "bg-red-600" : "bg-ink"
                                    }`}
                            >
                                {confirmDialog.confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </div>
            ) : null}
        </GlassCard>
    );
};

export default AdminPanel;
