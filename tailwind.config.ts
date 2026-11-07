import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "fade-up": { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "none" } },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "sheet-up": { "0%": { opacity: "0", transform: "translateY(40px)" }, "100%": { opacity: "1", transform: "none" } },
        pop: { "0%": { transform: "scale(.6)" }, "60%": { transform: "scale(1.18)" }, "100%": { transform: "scale(1)" } },
        shimmer: { "100%": { transform: "translateX(-100%)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
      },
      animation: {
        "fade-up": "fade-up .45s cubic-bezier(.2,.7,.2,1) both",
        "fade-in": "fade-in .3s ease both",
        "sheet-up": "sheet-up .35s cubic-bezier(.2,.8,.2,1) both",
        pop: "pop .35s cubic-bezier(.2,.8,.2,1) both",
        float: "float 5s ease-in-out infinite",
      },
      colors: {
        bg: "#080e0c",
        card: "#0f1815",
        card2: "#15211c",
        line: "#22342c",
        ink: "#eef4ef",
        mute: "#8aa196",
        brand: { DEFAULT: "#e6b34a", soft: "#3a2f12" },
        violet: { DEFAULT: "#a78bfa", soft: "#2a2150" },
        green: { DEFAULT: "#34d399", soft: "#0f3328", mid: "#1b6b53" },
        gold: { DEFAULT: "#f5c451", soft: "#3b3015" },
        rose: { DEFAULT: "#fb7185", soft: "#3d1a24" },
      },
      fontFamily: { sans: ["Tajawal", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
