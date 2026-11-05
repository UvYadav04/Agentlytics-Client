import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F6F5EE",        // Warm linen canvas (editorial warmth)
        card: "#FFFFFF",      // Pure crisp white card contrast
        border: "#E7E3D8",    // Soft parchment border
        text: "#1E1E1C",      // Deep charcoal ink (softer than harsh #000)
        muted: "#7F7C75",     // Warm slate muted text
        accent: {
          DEFAULT: "#C96442", // Primary Warm Terracotta / Rust
          dark: "#B05536",    // Deep terracotta on hover
          soft: "#F3E5DE",    // Subtle terracotta tint for badges/chips
        },
        teal: "#3F6F68",      // Deep Sage Green (research/documents)
        gold: "#D4A359",      // Mustard Gold (highlights)
        plum: "#8C6B93",      // Dusty Plum (secondary accents)
        rust: "#B5562E",      // Burnt Sienna
        clay: "#A35A39",      // Warm Clay
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        serif: [
          "Newsreader",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif",
        ],
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(30,30,28,0.04), 0 4px 16px rgba(30,30,28,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
