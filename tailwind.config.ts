import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A1220",
        surface: "#101C30",
        raised: "#16253D",
        line: "#1E3050",
        linesoft: "#182844",
        solar: "#F5A623",
        wind: "#3FC8D4",
        battery: "#9B8CFF",
        up: "#45D483",
        down: "#F0616D",
        fg: "#E9EFF8",
        muted: "#8CA1BE",
        dim: "#5C7397"
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"]
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.5)",
        glow: "0 0 24px -6px rgba(245,166,35,0.35)"
      }
    }
  },
  plugins: []
};
export default config;
