/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            fontFamily: {
                display: ["Space Grotesk", "sans-serif"],
                body: ["Plus Jakarta Sans", "sans-serif"]
            },
            colors: {
                ink: "#121722",
                mint: "#b7f4cf",
                coral: "#ff8c66",
                cloud: "#f3f6fb"
            },
            boxShadow: {
                glow: "0 20px 50px rgba(18, 23, 34, 0.12)",
                soft: "0 12px 30px rgba(18, 23, 34, 0.09)"
            },
            backdropBlur: {
                glass: "18px"
            }
        }
    },
    plugins: []
};
