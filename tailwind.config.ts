import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b1020",
        card: "#131a2e",
        card2: "#1a2340",
        line: "#26304f",
        ink: "#e8ecf8",
        mute: "#8f9ac0",
        blue: { DEFAULT: "#4f8cff", soft: "#1b2f5e" },
        green: { DEFAULT: "#34d399", soft: "#12372d" },
        gold: { DEFAULT: "#f5c451", soft: "#3b3015" },
        rose: { DEFAULT: "#fb7185", soft: "#3d1a24" },
      },
      fontFamily: { sans: ["Tajawal", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
