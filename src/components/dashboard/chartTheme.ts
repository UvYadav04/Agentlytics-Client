export type ChartMode = "light" | "dark";

export type ChartTokens = {
  surface: string;
  panel: string;
  border: string;
  grid: string;
  axis: string;
  textPrimary: string;
  textSecondary: string;
  series: string[];
};

export const CHART_TOKENS: Record<ChartMode, ChartTokens> = {
  light: {
    surface: "#ffffff",
    panel: "#f5f4ee",
    border: "#e8e4d9",
    grid: "#eeebe3",
    axis: "#b9b5ab",
    textPrimary: "#262624",
    textSecondary: "#6b6862",
    series: ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"],
  },
  dark: {
    surface: "#1a1a19",
    panel: "#121211",
    border: "#2e2d2a",
    grid: "#2a2927",
    axis: "#5c5a55",
    textPrimary: "#ffffff",
    textSecondary: "#c3c2b7",
    series: ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300", "#9085e9", "#e66767"],
  },
};

export const MAX_SERIES = 8;
export const PIE_MAX_SLICES = 6;
