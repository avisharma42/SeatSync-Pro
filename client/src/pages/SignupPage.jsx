import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";

import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const workIdRegex = /^[^\s@]+@[^\s@]+$/;

const normalizeWorkEmail = (value) => value.trim().toLowerCase();

const validateSignup = ({ name, email, password, confirmPassword }) => {
    const errors = {};
    const normalizedEmail = normalizeWorkEmail(email);

    if (!name.trim()) {
        errors.name = "Full name is required";
    }

    if (!normalizedEmail) {
        errors.email = "Email is required";
    } else if (!workIdRegex.test(normalizedEmail)) {
        errors.email = "Enter a valid work email or ID, like ritu@123";
    }

    if (password.length < 6) {
        errors.password = "Password must be at least 6 characters";
    }

    if (confirmPassword !== password) {
        errors.confirmPassword = "Passwords do not match";
    }

    return errors;
};

const SignupPage = () => {
    const { user, register } = useAuth();
    const { addToast } = useToast();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [squadId, setSquadId] = useState("1");
    const [batch, setBatch] = useState("A");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");

    if (user) return <Navigate to="/app" replace />;

    const onSubmit = async (event) => {
        event.preventDefault();
        const normalizedEmail = normalizeWorkEmail(email);
        const nextErrors = validateSignup({ name, email: normalizedEmail, password, confirmPassword });
        setErrors(nextErrors);
        setSubmitError("");
        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        setLoading(true);
        try {
            await register(normalizedEmail, password, name, squadId, batch);
            addToast({
                title: "Account Created",
                message: "Welcome! Your account has been created successfully.",
                type: "success"
            });
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Sign-up failed. Email may already exist.";
            setSubmitError(errorMsg);
            addToast({ title: "Sign-up Failed", message: errorMsg, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative grid min-h-screen place-items-center bg-pattern px-4 py-8">
            <motion.form
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={onSubmit}
                noValidate
                aria-busy={loading}
                className="w-full max-w-xl rounded-3xl border border-white/50 bg-white/75 p-6 shadow-glow backdrop-blur-glass md:p-8"
            >
                <div className="mb-6 border-b border-slate-200/80 pb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Get Started</p>
                    <h1 className="mt-1 font-display text-3xl text-ink">Create Account</h1>
                    <p className="mt-2 text-sm text-slate-600">Set your team preferences now so seat eligibility is ready from day one.</p>
                </div>

                <div className="grid gap-4">
                    <div>
                        <label htmlFor="signup-name" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Full Name
                        </label>
                        <input
                            id="signup-name"
                            type="text"
                            placeholder="Your full name"
                            className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            onBlur={() => setErrors((prev) => ({ ...prev, ...validateSignup({ name, email, password, confirmPassword }) }))}
                            disabled={loading}
                            aria-invalid={Boolean(errors.name)}
                            aria-describedby={errors.name ? "signup-name-error" : undefined}
                        />
                        {errors.name ? (
                            <p id="signup-name-error" className="mt-1 text-xs font-medium text-red-600" role="alert">
                                {errors.name}
                            </p>
                        ) : null}
                    </div>

                    <div>
                        <label htmlFor="signup-email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Work Email / ID
                        </label>
                        <input
                            id="signup-email"
                            type="text"
                            placeholder="ritu@123"
                            className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            onBlur={() => setErrors((prev) => ({ ...prev, ...validateSignup({ name, email, password, confirmPassword }) }))}
                            disabled={loading}
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={errors.email ? "signup-email-error" : undefined}
                        />
                        {errors.email ? (
                            <p id="signup-email-error" className="mt-1 text-xs font-medium text-red-600" role="alert">
                                {errors.email}
                            </p>
                        ) : null}
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                            <label htmlFor="signup-squad" className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Squad
                            </label>
                            <select
                                id="signup-squad"
                                value={squadId}
                                onChange={(event) => setSquadId(event.target.value)}
                                disabled={loading}
                                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm"
                            >
                                {Array.from({ length: 10 }, (_, i) => i + 1).map((squad) => (
                                    <option key={squad} value={squad}>
                                        Squad {squad}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="signup-batch" className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                                Batch
                            </label>
                            <select
                                id="signup-batch"
                                value={batch}
                                onChange={(event) => setBatch(event.target.value)}
                                disabled={loading}
                                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm"
                            >
                                <option value="A">Batch A (Mon-Wed)</option>
                                <option value="B">Batch B (Thu-Fri)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="signup-password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Password
                        </label>
                        <input
                            id="signup-password"
                            type="password"
                            placeholder="At least 6 characters"
                            className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            onBlur={() => setErrors((prev) => ({ ...prev, ...validateSignup({ name, email, password, confirmPassword }) }))}
                            disabled={loading}
                            aria-invalid={Boolean(errors.password)}
                            aria-describedby={errors.password ? "signup-password-error" : undefined}
                        />
                        {errors.password ? (
                            <p id="signup-password-error" className="mt-1 text-xs font-medium text-red-600" role="alert">
                                {errors.password}
                            </p>
                        ) : (
                            <p className="mt-1 text-xs text-slate-500">Use at least 6 characters.</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="signup-confirm-password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Confirm Password
                        </label>
                        <input
                            id="signup-confirm-password"
                            type="password"
                            placeholder="Retype password"
                            className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            onBlur={() => setErrors((prev) => ({ ...prev, ...validateSignup({ name, email, password, confirmPassword }) }))}
                            disabled={loading}
                            aria-invalid={Boolean(errors.confirmPassword)}
                            aria-describedby={errors.confirmPassword ? "signup-confirm-password-error" : undefined}
                        />
                        {errors.confirmPassword ? (
                            <p id="signup-confirm-password-error" className="mt-1 text-xs font-medium text-red-600" role="alert">
                                {errors.confirmPassword}
                            </p>
                        ) : null}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-1 rounded-2xl bg-ink px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Sign Up"}
                    </button>

                    {submitError ? (
                        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                            {submitError}
                        </p>
                    ) : null}
                </div>

                <p className="mt-4 text-center text-sm text-slate-600">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-ink hover:underline">
                        Login
                    </Link>
                </p>
            </motion.form>
        </main>
    );
};

export default SignupPage;
