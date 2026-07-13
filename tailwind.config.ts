import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // --- Boss Bros brand palette (work-truck / asphalt world) ---
        asphalt: "#12151A", // cool near-black base
        "asphalt-2": "#181C23", // slightly lifted asphalt for banding
        steel: "#232A34", // brushed-steel panel surface
        "steel-2": "#2C333F", // raised steel edge / hover
        concrete: "#AEB6C2", // muted steel-grey body text
        haz: {
          yellow: "#F5C518", // safety-vest yellow (primary accent)
          orange: "#F2661F", // safety-orange / truck paint (CTA)
        },
        paper: "#F3F0E9", // off-white for headlines/text on dark
      },
      fontFamily: {
        // Wired up to next/font CSS variables in layout.tsx
        display: ["var(--font-oswald)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        // Layered depth for the "3D-feel" steel panels
        panel: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 40px -20px rgba(0,0,0,0.7)",
        lift: "0 30px 60px -25px rgba(0,0,0,0.8), 0 2px 0 0 rgba(255,255,255,0.05) inset",
        haz: "0 12px 30px -8px rgba(242,102,31,0.45)",
      },
      backgroundImage: {
        "steel-plate":
          "linear-gradient(160deg, #2C333F 0%, #232A34 45%, #1B212A 100%)",
        "haz-stripe":
          "repeating-linear-gradient(45deg, #F5C518 0 14px, #12151A 14px 28px)",
      },
      keyframes: {
        "fill-rise": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
