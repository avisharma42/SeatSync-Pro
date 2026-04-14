import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";

import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const workIdRegex = /^[^\s@]+@[^\s@]+$/;

const normalizeWorkEmail = (value) => value.trim().toLowerCase();

const validateLogin = ({ email, password }) => {
    const errors = {};
    const normalizedEmail = normalizeWorkEmail(email);

    if (!normalizedEmail) {
        errors.email = "Email is required";
    } else if (!workIdRegex.test(normalizedEmail)) {
        errors.email = "Enter a valid work email or ID, like ritu@123";
    }

    if (!password.trim()) {
        errors.password = "Password is required";
    }

    return errors;
};

const LoginPage = () => {
    const { user, login } = useAuth();
    const { addToast } = useToast();
    const [email, setEmail] = useState("admin@org.com");
    const [password, setPassword] = useState("admin123");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");

    if (user) return <Navigate to="/app" replace />;

    const onSubmit = async (event) => {
        event.preventDefault();
        const normalizedEmail = normalizeWorkEmail(email);
        const nextErrors = validateLogin({ email: normalizedEmail, password });
        setErrors(nextErrors);
        setSubmitError("");
        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        setLoading(true);
        try {
            await login(normalizedEmail, password);
            addToast({
                title: "Welcome back",
                message: `Logged in successfully`,
                type: "success"
            });
        } catch (_e) {
            setSubmitError("Invalid credentials. Check your work email/ID and password.");
            addToast({
                title: "Login Failed",
                message: "Invalid credentials. Check your work email/ID and password.",
                type: "error"
            });
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
                <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-200/80 pb-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Flight-style Desk Ops</p>
                        <h1 className="mt-1 font-display text-3xl text-ink">SeatSync Pro</h1>
                        <p className="mt-2 max-w-sm text-sm text-slate-600">Book seats in seconds with live availability, weekly planning, and squad-based scheduling.</p>
                    </div>
                    <div className="hidden rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-xs text-slate-600 md:block">
                        <p className="font-semibold text-slate-700">Quick Demo</p>
                        <p>admin@org.com</p>
                        <p>admin123</p>
                    </div>
                </div>

                <div className="grid gap-4">
                    <div>
                        <label htmlFor="login-email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Work Email / ID
                        </label>
                        <input
                            id="login-email"
                            type="text"
                            placeholder="ritu@123"
                            className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            onBlur={() => setErrors((prev) => ({ ...prev, ...validateLogin({ email, password: "ok" }) }))}
                            disabled={loading}
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={errors.email ? "login-email-error" : undefined}
                        />
                        {errors.email ? (
                            <p id="login-email-error" className="mt-1 text-xs font-medium text-red-600" role="alert">
                                {errors.email}
                            </p>
                        ) : null}
                    </div>

                    <div>
                        <label htmlFor="login-password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Password
                        </label>
                        <input
                            id="login-password"
                            type="password"
                            placeholder="Enter password"
                            className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            onBlur={() => setErrors((prev) => ({ ...prev, ...validateLogin({ email: "a@a.com", password }) }))}
                            disabled={loading}
                            aria-invalid={Boolean(errors.password)}
                            aria-describedby={errors.password ? "login-password-error" : undefined}
                        />
                        {errors.password ? (
                            <p id="login-password-error" className="mt-1 text-xs font-medium text-red-600" role="alert">
                                {errors.password}
                            </p>
                        ) : null}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-1 rounded-2xl bg-ink px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    {submitError ? (
                        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                            {submitError}
                        </p>
                    ) : null}
                </div>

                <p className="mt-4 text-center text-sm text-slate-600">
                    New user?{" "}
                    <Link to="/signup" className="font-semibold text-ink hover:underline">
                        Create account
                    </Link>
                </p>
            </motion.form>
        </main>
    );
};

export default LoginPage;
