import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        caritas: "#CC0000",
        ink: "#1A1A1A",
        p1: "#028090",
        p2: "#00A896",
        p3: "#02C39A",
        p4: "#0891B2",
        p5: "#065A82",
        "st-offen": "#9CA3AF",
        "st-laufend": "#F59E0B",
        "st-erledigt": "#16A34A",
        milestone: "#D97706",
      },
    },
  },
  plugins: [],
};

export default config;
