import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // --- Boss Brothers Hauling brand palette (black + gold truck wrap) ---
        onyx: "#0B0B0C", // deep black base, matches the wrap background
        "onyx-2": "#131315", // slightly lifted black for banding
        char: "#1B1B1E", // charcoal panel surface
        "char-2": "#26262A", // raised charcoal edge / hover
        ash: "#A8A49C", // warm grey body text
        bone: "#F6F3EC", // off-white for headlines/text on black
        gold: {
          100: "#FBF0C9", // brightest highlight in the gold gradient
          200: "#F6E3A1",
          300: "#EFD27A", // light gold — kickers, links, figures
          400: "#E5BC55",
          500: "#D4A537", // core brand gold — CTAs, accents
          600: "#B8862A", // shaded gold — borders, gradient low
          700: "#8F661D", // deepest gold — engraved edges
        },
        alert: "#E2574A", // form errors — deliberately not gold
      },
      fontFamily: {
        // Wired up to next/font CSS variables in layout.tsx
        brand: ["var(--font-cinzel)", "Georgia", "serif"], // logo + headlines
        display: ["var(--font-oswald)", "system-ui", "sans-serif"], // UI/labels
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        // Layered depth for the "3D-feel" charcoal panels
        panel: "0 1px 0 0 rgba(255,255,255,0.05) inset, 0 20px 40px -20px rgba(0,0,0,0.85)",
        lift: "0 30px 60px -25px rgba(0,0,0,0.9), 0 2px 0 0 rgba(255,255,255,0.06) inset",
        gold: "0 12px 30px -10px rgba(212,165,55,0.5)",
      },
      backgroundImage: {
        plate: "linear-gradient(160deg, #26262A 0%, #1B1B1E 45%, #121214 100%)",
        "gold-sheen":
          "linear-gradient(180deg, #FBF0C9 0%, #E5BC55 38%, #B8862A 52%, #F0DA9B 74%, #C9992E 100%)",
        "gold-stripe":
          "repeating-linear-gradient(45deg, #D4A537 0 14px, #0B0B0C 14px 28px)",
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
