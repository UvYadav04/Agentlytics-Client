import type { Config } from "tailwindcss";

// Matches the palette already used in generated dashboards/reports
// (Server/analyzerEngine/tools/reporting/reporting_tools.py) so the app
// shell and generated content feel like one product, not two.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F5F4EE",
        card: "#FFFFFF",
        border: "#E8E4D9",
        text: "#262624",
        muted: "#83807A",
        accent: {
          DEFAULT: "#CC785C",
          dark: "#B35F45",
          soft: "#F3E4DC",
        },
        teal: "#4A7C7C",
        gold: "#D9A566",
        plum: "#8B6F9E",
        rust: "#B0562B",
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
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(61,57,41,0.05), 0 4px 16px rgba(61,57,41,0.07)",
      },
    },
  },
  plugins: [],
};

export default config;
