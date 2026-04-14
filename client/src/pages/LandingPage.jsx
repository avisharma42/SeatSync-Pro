import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const metrics = [
    { value: "92%", label: "Desk adoption rate" },
    { value: "2.8k+", label: "Teams coordinated" },
    { value: "4.9/5", label: "Average user satisfaction" }
];

const capabilities = [
    "Live desk and floater availability",
    "Squad and batch-aware planning",
    "Holiday and leave aware scheduling",
    "Real-time seat updates across teams"
];

const integrations = [
    { name: "Outlook", mark: "O", tint: "bg-blue-50 text-blue-700 border-blue-100" },
    { name: "Microsoft Teams", mark: "T", tint: "bg-indigo-50 text-indigo-700 border-indigo-100" },
    { name: "Slack", mark: "S", tint: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100" },
    { name: "Google Calendar", mark: "G", tint: "bg-sky-50 text-sky-700 border-sky-100" },
    { name: "Workday", mark: "W", tint: "bg-amber-50 text-amber-700 border-amber-100" },
    { name: "Jira", mark: "J", tint: "bg-cyan-50 text-cyan-700 border-cyan-100" },
    { name: "BambooHR", mark: "B", tint: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    { name: "Notion", mark: "N", tint: "bg-slate-100 text-slate-700 border-slate-200" }
];

const trustLogos = ["Remax", "SmartSweets", "University Hub", "Vertex Labs", "Airtask", "Cloudberry"];

const testimonials = [
    {
        quote: "Before SeatSync Pro, Mondays were chaos. Now every team knows exactly where to sit.",
        author: "Roachel A.",
        role: "Workplace Manager"
    },
    {
        quote: "We deployed in under a week and reduced desk conflicts by over 60%.",
        author: "Nikhil K.",
        role: "IT Operations"
    }
];

const plans = [
    {
        name: "Starter",
        price: "$0",
        note: "for up to 40 users",
        features: ["Basic desk booking", "Weekly scheduling", "Email support"],
        cta: "Start Free"
    },
    {
        name: "Scale",
        price: "$5",
        note: "per user / month",
        features: ["Live occupancy analytics", "Admin controls", "Calendar integrations", "Priority support"],
        cta: "Start Trial",
        highlight: true
    },
    {
        name: "Enterprise",
        price: "Custom",
        note: "for distributed workplaces",
        features: ["SSO + SCIM", "Advanced policies", "Dedicated CSM"],
        cta: "Talk to Sales"
    }
];

const LandingPage = () => {
    return (
        <main className="bg-pattern min-h-screen px-4 py-6 text-ink md:px-8">
            <section className="mx-auto max-w-6xl">
                <motion.header
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sticky top-3 z-20 rounded-3xl border border-white/55 bg-white/80 px-5 py-4 shadow-soft backdrop-blur-glass md:px-8"
                >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-sm font-bold text-white">SS</div>
                            <div>
                                <p className="font-display text-xl leading-none">SeatSync Pro</p>
                                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Hybrid Workplace OS</p>
                            </div>
                        </div>

                        <nav className="hidden items-center gap-5 text-sm font-semibold text-slate-600 lg:flex">
                            <a href="#product" className="transition hover:text-ink">
                                Product
                            </a>
                            <a href="#assistant" className="transition hover:text-ink">
                                Assistant
                            </a>
                            <a href="#integrations" className="transition hover:text-ink">
                                Integrations
                            </a>
                            <a href="#pricing" className="transition hover:text-ink">
                                Pricing
                            </a>
                        </nav>

                        <div className="flex items-center gap-2">
                            <Link
                                to="/login"
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Log In
                            </Link>
                            <Link to="/signup" className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
                                Start Free
                            </Link>
                        </div>
                    </div>
                </motion.header>

                <section id="product" className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-3xl border border-white/45 bg-white/80 p-6 shadow-glow backdrop-blur-glass md:p-8"
                    >
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">The smart way to run office presence</p>
                        <h1 className="mt-3 max-w-xl font-display text-4xl leading-tight md:text-5xl">
                            Smart space, happy teams.
                        </h1>
                        <p className="mt-4 max-w-xl text-base text-slate-600">
                            SeatSync Pro gives every team one clear view of who is in-office, where they sit, and what is still available in real-time.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link to="/signup" className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">
                                Get Started
                            </Link>
                            <Link
                                to="/login"
                                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Open Dashboard
                            </Link>
                        </div>

                        <div className="mt-7 grid gap-3 sm:grid-cols-3">
                            {metrics.map((metric) => (
                                <article key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                                    <p className="font-display text-2xl leading-none">{metric.value}</p>
                                    <p className="mt-1 text-xs text-slate-600">{metric.label}</p>
                                </article>
                            ))}
                        </div>

                        <div className="mt-7 border-t border-slate-200 pt-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Trusted by operations teams at</p>
                            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-slate-500 sm:grid-cols-6">
                                {trustLogos.map((logo) => (
                                    <div key={logo} className="rounded-xl border border-slate-200 bg-white px-2 py-2">
                                        {logo}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className="relative rounded-3xl border border-white/45 bg-white/80 p-4 shadow-soft backdrop-blur-glass"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="absolute -left-2 -top-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 shadow-soft"
                        >
                            8 floater seats left
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.28 }}
                            className="absolute -bottom-3 right-4 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 shadow-soft"
                        >
                            Desk confirmed for Marketing
                        </motion.div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-slate-700">SeatSync Live Board</p>
                                    <p className="text-xs text-slate-500">Updated in real-time</p>
                                </div>
                                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Live</span>
                            </div>

                            <div className="grid gap-3 md:grid-cols-[0.95fr_1.05fr]">
                                <div className="rounded-xl border border-slate-200 bg-white p-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Today</p>
                                    <ul className="mt-2 space-y-2 text-xs text-slate-600">
                                        {[
                                            "Roachel • Desk F-12",
                                            "Aarya • Desk F-09",
                                            "Nitin • Desk FL-03",
                                            "Sasha • Desk F-33"
                                        ].map((item) => (
                                            <li key={item} className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1">
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-white p-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                                            <p className="text-[11px] text-slate-500">Allocated</p>
                                            <p className="font-display text-xl">42/50</p>
                                        </div>
                                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                                            <p className="text-[11px] text-slate-500">Utilization</p>
                                            <p className="font-display text-xl">84%</p>
                                        </div>
                                    </div>

                                    <div className="mt-3 space-y-2">
                                        {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, index) => (
                                            <div key={day} className="flex items-center gap-2">
                                                <p className="w-8 text-[11px] font-semibold text-slate-500">{day}</p>
                                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${56 + index * 9}%` }}
                                                        transition={{ duration: 0.5, delay: index * 0.06 }}
                                                        className="h-full rounded-full bg-ink"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                <section className="mt-10 grid gap-5 rounded-3xl border border-white/50 bg-white/75 p-6 shadow-soft backdrop-blur-glass md:grid-cols-2 md:p-8">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Capabilities</p>
                        <h2 className="mt-2 font-display text-3xl leading-tight">Coordinate every in-office moment.</h2>
                        <p className="mt-3 text-sm text-slate-600">Built for hybrid teams that need speed, clarity, and fewer scheduling conflicts.</p>
                    </div>
                    <ul className="grid gap-2">
                        {capabilities.map((item) => (
                            <li key={item} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                                {item}
                            </li>
                        ))}
                    </ul>
                </section>

                <section id="assistant" className="mt-10 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="rounded-3xl border border-white/50 bg-white/75 p-6 shadow-soft backdrop-blur-glass md:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">SeatSync Assistant</p>
                        <h3 className="mt-2 font-display text-3xl">Your workplace co-pilot</h3>
                        <p className="mt-3 text-sm text-slate-600">
                            Get quick answers for policy rules, request support, and handle desk actions without jumping between tools.
                        </p>
                        <Link to="/signup" className="mt-5 inline-block rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">
                            Create Workspace
                        </Link>
                    </div>

                    <div className="rounded-3xl border border-white/50 bg-white/75 p-6 shadow-soft backdrop-blur-glass md:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">What customers say</p>
                        <div className="mt-4 grid gap-3">
                            {testimonials.map((item) => (
                                <blockquote key={item.author} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm">
                                    <p className="text-slate-700">"{item.quote}"</p>
                                    <footer className="mt-3 text-xs text-slate-500">
                                        <span className="font-semibold text-slate-700">{item.author}</span> • {item.role}
                                    </footer>
                                </blockquote>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="integrations" className="mt-10 rounded-3xl border border-white/50 bg-white/75 p-6 shadow-soft backdrop-blur-glass md:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Integrations</p>
                    <h3 className="mt-2 font-display text-3xl">Connected to the tools you already trust</h3>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">Sync calendars, team channels, HR systems, and ticketing workflows without changing your existing stack.</p>
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {integrations.map((tool) => (
                            <div key={tool.name} className="rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700">
                                <div className="flex items-center gap-2">
                                    <div className={`grid h-8 w-8 place-items-center rounded-lg border text-xs font-bold ${tool.tint}`}>{tool.mark}</div>
                                    <p className="leading-tight">{tool.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="pricing" className="mt-10 rounded-3xl border border-white/50 bg-white/75 p-6 shadow-soft backdrop-blur-glass md:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Pricing</p>
                    <h3 className="mt-2 font-display text-3xl">Choose your rollout pace</h3>
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                        {plans.map((plan) => (
                            <article
                                key={plan.name}
                                className={`rounded-2xl border p-4 ${plan.highlight
                                    ? "border-ink bg-ink text-white shadow-soft"
                                    : "border-slate-200 bg-white text-slate-700"
                                    }`}
                            >
                                <p className={`text-xs uppercase tracking-[0.18em] ${plan.highlight ? "text-slate-300" : "text-slate-500"}`}>{plan.name}</p>
                                <p className="mt-2 font-display text-3xl">{plan.price}</p>
                                <p className={`text-xs ${plan.highlight ? "text-slate-300" : "text-slate-500"}`}>{plan.note}</p>
                                <ul className="mt-3 grid gap-1 text-sm">
                                    {plan.features.map((feature) => (
                                        <li key={feature}>• {feature}</li>
                                    ))}
                                </ul>
                                <Link
                                    to="/signup"
                                    className={`mt-4 inline-block rounded-xl px-4 py-2 text-sm font-semibold transition ${plan.highlight
                                        ? "border border-white/35 bg-white text-ink hover:bg-slate-100"
                                        : "bg-ink text-white hover:opacity-90"
                                        }`}
                                >
                                    {plan.cta}
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>

                <footer className="mt-10 mb-4 rounded-3xl border border-white/50 bg-white/75 px-6 py-5 shadow-soft backdrop-blur-glass">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                        <p>
                            <span className="font-display text-base text-ink">SeatSync Pro</span> • Workspace coordination made simple.
                        </p>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Integrations</p>
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="font-semibold text-ink hover:underline">
                                Log In
                            </Link>
                            <Link to="/signup" className="font-semibold text-ink hover:underline">
                                Start Free
                            </Link>
                        </div>
                    </div>
                </footer>
            </section>
        </main>
    );
};

export default LandingPage;
