const GlassCard = ({ children, className = "" }) => {
    return (
        <div
            className={`rounded-3xl border border-white/45 bg-white/60 p-4 shadow-glow backdrop-blur-glass ${className}`}
        >
            {children}
        </div>
    );
};

export default GlassCard;
