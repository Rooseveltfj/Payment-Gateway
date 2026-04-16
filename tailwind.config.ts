import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        card: "#111113",
        hover: "#1a1a1f",
        primary: {
          DEFAULT: "#7c3aed",
          foreground: "#fafafa",
        },
        secondary: {
          DEFAULT: "#8b5cf6",
          foreground: "#fafafa",
        },
        border: "rgba(255,255,255,0.08)",
        text: {
          primary: "#fafafa",
          secondary: "#a1a1aa",
        },
        success: "#22c55e",
        error: "#ef4444",
        warning: "#f59e0b",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
