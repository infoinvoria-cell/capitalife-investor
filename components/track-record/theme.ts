import type { TrackRecordTheme } from "@/components/track-record/metrics";

export type TrackRecordPalette = {
  id: TrackRecordTheme;
  name: string;
  watermarkLogo: string;
  pageBackground: string;
  panelBackground: string;
  panelBackgroundStrong: string;
  panelBorder: string;
  panelGlow: string;
  panelShadow: string;
  text: string;
  heading: string;
  muted: string;
  accent: string;
  accentSoft: string;
  accentStrong: string;
  positive: string;
  success: string;
  negative: string;
  neutral: string;
  grid: string;
  tableHeader: string;
  chart: {
    curve1x: string;
    curve2x: string;
    curve3x: string;
    curve4x: string;
    curve5x: string;
    compareSp500: string;
    compareDax40: string;
  };
};

export const TRACK_RECORD_THEMES: Record<TrackRecordTheme, TrackRecordPalette> = {
  dark: {
    id: "dark",
    name: "Dark",
    watermarkLogo: "/assets/brand/CAPITALIFE_Logo.png",
    pageBackground: "transparent",
    panelBackground: "linear-gradient(180deg, rgba(14,14,14,0.9) 0%, rgba(8,8,8,0.88) 100%)",
    panelBackgroundStrong: "linear-gradient(180deg, rgba(15,15,15,0.94) 0%, rgba(9,9,9,0.9) 100%)",
    panelBorder: "rgba(236,219,166,0.14)",
    panelGlow: "rgba(236,219,166,0.08)",
    panelShadow: "0 18px 36px rgba(0,0,0,0.44), inset 0 1px 0 rgba(255,255,255,0.04)",
    text: "#ffffff",
    heading: "#fffaf0",
    muted: "#8f98a3",
    accent: "#D6C38F",
    accentSoft: "#efe1b6",
    accentStrong: "#f6eac9",
    positive: "#D6C38F",
    success: "#D6C38F",
    negative: "#e05656",
    neutral: "#d7dce3",
    grid: "rgba(255,255,255,0.06)",
    tableHeader: "rgba(255,255,255,0.025)",
    chart: {
      curve1x: "#ffffff",
      curve2x: "#efe1b6",
      curve3x: "#D6C38F",
      curve4x: "#b99953",
      curve5x: "#f5d47b",
      compareSp500: "#ff4d6d",
      compareDax40: "#9d5cff",
    },
  },
  blue: {
    id: "blue",
    name: "Blue",
    watermarkLogo: "/assets/brand/CAPITALIFE_Logo.png",
    pageBackground: "transparent",
    panelBackground: "linear-gradient(180deg, rgba(12,18,28,0.9) 0%, rgba(8,10,14,0.88) 100%)",
    panelBackgroundStrong: "linear-gradient(180deg, rgba(12,18,28,0.94) 0%, rgba(8,10,14,0.9) 100%)",
    panelBorder: "rgba(255,255,255,0.12)",
    panelGlow: "rgba(255,255,255,0.06)",
    panelShadow: "0 18px 36px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.04)",
    text: "#ffffff",
    heading: "#eef4ff",
    muted: "#92a6c8",
    accent: "#4d87fe",
    accentSoft: "#8fb6ff",
    accentStrong: "#dce8ff",
    positive: "#8fb6ff",
    success: "#39ff40",
    negative: "#e05656",
    neutral: "#d7dce3",
    grid: "rgba(255,255,255,0.06)",
    tableHeader: "rgba(255,255,255,0.025)",
    chart: {
      curve1x: "#ffffff",
      curve2x: "#bfd4ff",
      curve3x: "#78a8ff",
      curve4x: "#3f6fdf",
      curve5x: "#4dc8ff",
      compareSp500: "#ff4d6d",
      compareDax40: "#9d5cff",
    },
  },
};

export function getTrackRecordThemePalette(theme: TrackRecordTheme): TrackRecordPalette {
  return TRACK_RECORD_THEMES[theme];
}
