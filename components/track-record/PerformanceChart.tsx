"use client";

import { useEffect, useMemo, useState } from "react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  ChartPoint,
  ChartViewMode,
  ComparisonAssetId,
  ComparisonKey,
  MultiplierKey,
  TrackRecordTheme,
} from "@/components/track-record/metrics";
import { formatSignedPercent, getChartDataForMode } from "@/components/track-record/metrics";
import { getTrackRecordThemePalette } from "@/components/track-record/theme";

const CURVES: Array<{ key: MultiplierKey; label: string }> = [
  { key: "curve1x", label: "1x" },
  { key: "curve2x", label: "2x" },
  { key: "curve3x", label: "3x" },
  { key: "curve4x", label: "4x" },
  { key: "curve5x", label: "5x" },
];

type ComparisonOption = {
  id: ComparisonAssetId;
  key: ComparisonKey;
  label: string;
  shortLabel: string;
  correlation: number;
  isLoaded: boolean;
  color?: string;
};

type Props = {
  chartData: ChartPoint[];
  activeMultipliers: number[];
  onMultiplierChange: (multipliers: number[]) => void;
  chartMode: ChartViewMode;
  onChartModeChange: (mode: ChartViewMode) => void;
  comparisonOptions?: ComparisonOption[];
  activeComparisons?: ComparisonAssetId[];
  onComparisonChange?: (comparisons: ComparisonAssetId[]) => void;
  theme: TrackRecordTheme;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
};

const CHART_MODE_OPTIONS: Array<{ value: ChartViewMode; label: string; short: string; mobileWidth: number; desktopWidth: number }> = [
  { value: "monthly", label: "Monthly", short: "M", mobileWidth: 84, desktopWidth: 96 },
  { value: "quarterly", label: "Quarterly", short: "Q", mobileWidth: 92, desktopWidth: 108 },
  { value: "yearly", label: "Yearly", short: "Y", mobileWidth: 78, desktopWidth: 90 },
];

const HOME_GLASS_BACKGROUND = [
  "linear-gradient(180deg, rgba(255, 255, 255, 0.078), rgba(255, 255, 255, 0.02))",
  "linear-gradient(135deg, rgba(255, 215, 120, 0.04), rgba(255, 255, 255, 0) 42%)",
  "linear-gradient(180deg, rgba(16, 14, 10, 0.88), rgba(8, 8, 8, 0.82))",
].join(", ");

const HOME_GLASS_SHADOW = [
  "inset 0 1px 0 rgba(255, 247, 227, 0.07)",
  "inset 0 -18px 36px rgba(0, 0, 0, 0.18)",
  "0 22px 48px rgba(0, 0, 0, 0.62)",
  "0 0 28px rgba(236, 219, 166, 0.08)",
].join(", ");

type ActiveLine = {
  id: string;
  dataKey: MultiplierKey | ComparisonKey;
  label: string;
  endLabel: string;
  stroke: string;
  width: number;
  glow: boolean;
  dashed?: boolean;
};

type LabelIcon =
  | { type: "image"; src: string; alt: string }
  | { type: "badge"; text: string; background: string; color: string };

function formatDateInputValue(value: string | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function formatDisplayDate(value: string | undefined): string {
  if (!value) return "--.--.----";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

function clampIndex(value: number, max: number): number {
  return Math.min(Math.max(value, 0), max);
}

function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function findClosestIndex(chartData: ChartPoint[], targetDate: string): number {
  const target = new Date(targetDate).getTime();
  if (!Number.isFinite(target) || chartData.length === 0) return 0;

  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  chartData.forEach((point, index) => {
    const distance = Math.abs(new Date(point.fullDate).getTime() - target);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex;
}

export default function PerformanceChart({
  chartData,
  activeMultipliers,
  onMultiplierChange,
  chartMode,
  onChartModeChange,
  comparisonOptions = [],
  activeComparisons = [],
  onComparisonChange,
  theme,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [rangeStartIndex, setRangeStartIndex] = useState(0);
  const [rangeEndIndex, setRangeEndIndex] = useState(Math.max(chartData.length - 1, 0));
  const palette = getTrackRecordThemePalette(theme);
  const sortedActiveMultipliers = useMemo(() => [...activeMultipliers].sort((left, right) => left - right), [activeMultipliers]);
  const sortedActiveComparisons = useMemo(
    () => comparisonOptions.filter((option) => activeComparisons.includes(option.id)),
    [activeComparisons, comparisonOptions],
  );
  const maxRangeIndex = Math.max(chartData.length - 1, 0);
  const activeRangeStartIndex = clampIndex(Math.min(rangeStartIndex, rangeEndIndex), maxRangeIndex);
  const activeRangeEndIndex = clampIndex(Math.max(rangeStartIndex, rangeEndIndex), maxRangeIndex);
  const rangeStartPercent = maxRangeIndex > 0 ? (activeRangeStartIndex / maxRangeIndex) * 100 : 0;
  const rangeEndPercent = maxRangeIndex > 0 ? (activeRangeEndIndex / maxRangeIndex) * 100 : 100;
  const rangeStartRatio = rangeStartPercent / 100;
  const rangeWidthRatio = Math.max(rangeEndPercent - rangeStartPercent, 0) / 100;
  const rangeStartDate = chartData[activeRangeStartIndex]?.fullDate;
  const rangeEndDate = chartData[activeRangeEndIndex]?.fullDate;
  const filteredChartData = useMemo(
    () => chartData.slice(activeRangeStartIndex, activeRangeEndIndex + 1),
    [activeRangeEndIndex, activeRangeStartIndex, chartData],
  );
  const visibleChartData = useMemo(() => getChartDataForMode(filteredChartData, chartMode), [filteredChartData, chartMode]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setRangeStartIndex(0);
    setRangeEndIndex(Math.max(chartData.length - 1, 0));
  }, [chartData.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 768px)");
    const legacyMedia = media as MediaQueryList & {
      addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
      removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
    };
    const apply = (matches: boolean) => {
      setIsMobileViewport(matches);
    };

    apply(media.matches);
    const onChange = (event: MediaQueryListEvent) => apply(event.matches);
    if ("addEventListener" in media) {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }
    legacyMedia.addListener?.(onChange);
    return () => legacyMedia.removeListener?.(onChange);
  }, []);

  const getCurveStroke = (curveKey: MultiplierKey) =>
    curveKey === "curve1x"
      ? palette.chart.curve1x
      : curveKey === "curve2x"
        ? palette.chart.curve2x
        : curveKey === "curve3x"
          ? palette.chart.curve3x
          : curveKey === "curve4x"
            ? palette.chart.curve4x
            : palette.chart.curve5x;

  const getComparisonStroke = (comparisonKey: ComparisonKey, fallbackColor?: string) =>
    fallbackColor
      || (comparisonKey === "compareSp500" ? palette.chart.compareSp500 : palette.chart.compareDax40);

  const activeLines = useMemo<ActiveLine[]>(() => {
    const multiplierLines = sortedActiveMultipliers.map((multiplier) => {
      const curveKey = `curve${multiplier}x` as MultiplierKey;
      return {
        id: curveKey,
        dataKey: curveKey,
        label: `${multiplier}x`,
        endLabel: `${multiplier}x`,
        stroke: getCurveStroke(curveKey),
        width: multiplier === 1 ? 1.9 : 1.55,
        glow: multiplier === 5,
      };
    });

    const comparisonLines = sortedActiveComparisons.map((comparison) => ({
      id: comparison.id,
      dataKey: comparison.key,
      label: `${comparison.label} (corr ${comparison.correlation.toFixed(2)})`,
      endLabel: comparison.label,
      stroke: getComparisonStroke(comparison.key, comparison.color),
      width: 1.35,
      glow: false,
      dashed: true,
    }));

    return [...multiplierLines, ...comparisonLines];
  }, [sortedActiveComparisons, sortedActiveMultipliers]);

  const chartDomain = useMemo(() => {
    const values: number[] = [];

    visibleChartData.forEach((point) => {
      activeLines.forEach((line) => {
        const candidate = Number(point[line.dataKey]);
        if (Number.isFinite(candidate)) {
          values.push(candidate);
        }
      });
    });

    if (!values.length) {
      return { min: 0, max: 100 };
    }

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = Math.max(maxValue - minValue, 8);
    const padding = Math.max(range * 0.14, 4);

    return {
      min: Math.floor((minValue - padding) / 5) * 5,
      max: Math.ceil((maxValue + padding) / 5) * 5,
    };
  }, [activeLines, visibleChartData]);

  const toggleMultiplier = (multiplier: number) => {
    const isActive = sortedActiveMultipliers.includes(multiplier);
    if (isActive && sortedActiveMultipliers.length === 1) {
      return;
    }

    const next = isActive
      ? sortedActiveMultipliers.filter((value) => value !== multiplier)
      : [...sortedActiveMultipliers, multiplier].sort((left, right) => left - right);

    onMultiplierChange(next);
  };

  const toggleComparison = (comparisonId: ComparisonAssetId) => {
    if (!onComparisonChange) return;
    const isActive = activeComparisons.includes(comparisonId);
    const next = isActive
      ? activeComparisons.filter((value) => value !== comparisonId)
      : [...activeComparisons, comparisonId];
    onComparisonChange(next);
  };

  const createLastPointRenderer = (line: ActiveLine, labelOffsetIndex: number) => {
    function LastPointRenderer(props: any): JSX.Element {
      if (props.index !== visibleChartData.length - 1) return <g />;

      const cx = Number(props.cx);
      const cy = Number(props.cy);
      if (!Number.isFinite(cx) || !Number.isFinite(cy)) return <g />;

      const label = formatSignedPercent(Number(props.value ?? 0) / 100);
      const icon = getLabelIcon(line);
      const iconWidth = icon ? 18 : 0;
      const labelWidth = Math.max(62, label.length * 6 + 20 + iconWidth);
      const verticalOffset = (labelOffsetIndex - (activeLines.length - 1) / 2) * 15;
      const viewBoxX = Number(props.viewBox?.x ?? 0);
      const viewBoxY = Number(props.viewBox?.y ?? 0);
      const viewBoxWidth = Number(props.viewBox?.width ?? 0);
      const viewBoxHeight = Number(props.viewBox?.height ?? 0);
      const rawLabelX = cx + 6 + labelWidth > viewBoxX + viewBoxWidth - 14 ? cx - labelWidth - 14 : cx + 6;
      const labelX = viewBoxWidth > 0
        ? clampValue(rawLabelX, viewBoxX + 4, viewBoxX + viewBoxWidth - labelWidth - 4)
        : rawLabelX;
      const rawLabelY = cy - 11 + verticalOffset;
      const labelY = viewBoxHeight > 0
        ? clampValue(rawLabelY, viewBoxY + 4, viewBoxY + viewBoxHeight - 24)
        : rawLabelY;

      return (
        <g>
          <circle cx={cx} cy={cy} r={2.75} fill={line.stroke} stroke="rgba(6,8,11,0.95)" strokeWidth={1.15} />
          <g transform={`translate(${labelX}, ${labelY})`}>
            <rect
              width={labelWidth}
              height={20}
              rx={6}
              fill="rgba(8,9,11,0.94)"
              stroke={line.stroke}
              strokeOpacity={0.58}
              strokeWidth={1.1}
            />
            {icon ? (
              icon.type === "image" ? (
                <image href={icon.src} x={7} y={4.2} width={12} height={12} preserveAspectRatio="xMidYMid meet" />
              ) : (
                <g transform="translate(7, 4)">
                  <rect width={12} height={12} rx={6} fill={icon.background} />
                  <text x={6} y={8.4} textAnchor="middle" fill={icon.color} fontSize={5.3} fontWeight={800}>
                    {icon.text}
                  </text>
                </g>
              )
            ) : null}
            <text x={icon ? 24 : labelWidth / 2} y={13} textAnchor={icon ? "start" : "middle"} fill={line.stroke} fontSize={9.5} fontWeight={700}>
              {label}
            </text>
          </g>
        </g>
      );
    }

    return LastPointRenderer;
  };

  const getLabelIcon = (line: ActiveLine): LabelIcon | null => {
    if (line.dataKey === "compareSp500") {
      return { type: "image", src: "/assets/brand/SP500.png", alt: "S&P 500" };
    }

    if (line.dataKey === "compareDax40") {
      return { type: "badge", text: "DAX", background: "#9d5cff", color: "#ffffff" };
    }

    return { type: "image", src: "/assets/brand/CAPITALIFE_ICON.png", alt: "Capitalife" };
  };

  const chartLineType = chartMode === "monthly" || chartMode === "quarterly" || chartMode === "yearly" ? "linear" : "monotone";
  const tooltipLabelFormatter = (_value: unknown, payload?: ReadonlyArray<{ payload?: ChartPoint }>) => {
    const point = payload?.[0]?.payload;
    if (!point?.fullDate) return "";

    const date = new Date(point.fullDate);
    if (Number.isNaN(date.getTime())) return point.fullDate;

    if (chartMode === "monthly") {
      return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
    }

    if (chartMode === "quarterly" || chartMode === "yearly") {
      return date.toLocaleDateString("de-DE", { month: "2-digit", year: "numeric", timeZone: "UTC" });
    }

    return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
  };

  return (
    <section
      className="performance-chart-shell relative flex h-full min-h-0 min-w-0 w-full max-w-full flex-col overflow-hidden rounded-[28px] border px-[18px] pb-[20px] pt-[20px] min-[769px]:px-[22px] min-[769px]:pb-[22px] min-[769px]:pt-[22px] backdrop-blur-[18px]"
      style={{
        background: [
          "linear-gradient(135deg, rgba(255,228,148,0.14) 0%, rgba(255,228,148,0.035) 26%, rgba(255,255,255,0.014) 46%, rgba(8,8,10,0) 72%)",
          HOME_GLASS_BACKGROUND,
          "radial-gradient(circle at 78% 2%, rgba(236,219,166,0.18), transparent 30%)",
        ].join(", "),
        borderColor: "rgba(236,219,166,0.18)",
        boxShadow: [
          HOME_GLASS_SHADOW,
          "0 0 36px rgba(236,219,166,0.08)",
        ].join(", "),
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[28px]"
        style={{
          background: "linear-gradient(135deg, rgba(255,221,140,0.02), transparent 34%, rgba(255,255,255,0.012) 68%, transparent)",
        }}
      />
      <div className="relative z-[1] mb-5 flex min-w-0 flex-col items-start gap-4">
        <div className="flex w-full items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: palette.accent }}>
              Performance
            </div>
            <div className="text-[14px] font-semibold tracking-[-0.02em] min-[769px]:text-[15px]" style={{ color: palette.heading }}>
              Track Record Overview
            </div>
          </div>

          <img src="/assets/brand/CAPITALIFE_ICON.png" alt="Capitalife" className="h-8 w-8 shrink-0 object-contain opacity-95" />
        </div>

        <div className="flex w-full min-w-0 items-center gap-2 overflow-hidden pb-1">
          <div
            className="inline-flex h-10 w-full min-w-0 max-w-[146px] shrink-0 items-center gap-1 rounded-full border p-1 min-[390px]:max-w-[156px] min-[769px]:max-w-[190px]"
            style={{
              borderColor: "rgba(236,219,166,0.12)",
              background: "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            {CHART_MODE_OPTIONS.map((option) => {
              const isActive = chartMode === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChartModeChange(option.value)}
                  className="inline-flex min-h-[34px] items-center overflow-hidden rounded-full px-2 py-2 text-[7px] font-semibold uppercase tracking-[0.08em] outline-none transition-all duration-300 min-[390px]:px-2.5 min-[390px]:text-[8px]"
                  style={{
                    border: "1px solid transparent",
                    borderColor: isActive ? "rgba(236,219,166,0.22)" : "transparent",
                    background: isActive ? "linear-gradient(180deg, rgba(247,233,191,0.34), rgba(217,184,76,0.16))" : "transparent",
                    boxShadow: isActive ? "0 0 14px rgba(236,219,166,0.12)" : "none",
                    color: isActive ? palette.heading : palette.muted,
                    minWidth: isActive ? (isMobileViewport ? option.mobileWidth : option.desktopWidth) : 28,
                  }}
                >
                  <span>{option.short}</span>
                  <span
                    className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                      isActive ? "ml-1 opacity-100" : "ml-0 max-w-0 opacity-0"
                    }`}
                    style={{ maxWidth: isActive ? (isMobileViewport ? option.mobileWidth - 22 : option.desktopWidth - 24) : 0 }}
                  >
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 overflow-hidden">
            <div className="shrink-0 pl-1 pr-0.5 text-[8px] font-semibold uppercase tracking-[0.18em]" style={{ color: palette.muted }}>
              Compare
            </div>
            {comparisonOptions.map((comparison) => {
              const isActive = activeComparisons.includes(comparison.id);
              const comparisonColor = getComparisonStroke(comparison.key, comparison.color);
              return (
                <button
                  key={comparison.id}
                  type="button"
                  onClick={() => toggleComparison(comparison.id)}
                  className="inline-flex min-h-[34px] min-w-0 shrink-0 items-center overflow-hidden rounded-full border px-2 py-2 text-[8px] font-semibold uppercase tracking-[0.1em] outline-none transition-all duration-300"
                  style={{
                    borderColor: isActive ? `${comparisonColor}66` : palette.panelBorder,
                    background: isActive
                      ? `linear-gradient(180deg, ${comparisonColor}2e, ${comparisonColor}14)`
                      : "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))",
                    color: isActive ? palette.heading : palette.muted,
                    boxShadow: isActive ? `0 0 16px ${comparisonColor}22` : "none",
                  }}
                >
                  <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full" style={{ background: comparisonColor, boxShadow: `0 0 10px ${comparisonColor}` }} />
                  <span>{comparison.shortLabel}</span>
                  <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isActive ? "ml-1.5 opacity-100" : "ml-0 max-w-0 opacity-0"}`} style={{ maxWidth: isActive ? (isMobileViewport ? 0 : 64) : 0 }}>
                    {comparison.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex w-full flex-col gap-3">
          <div className="flex flex-wrap items-center gap-1.5 min-[769px]:gap-2">
            <div className="text-[9px] font-semibold uppercase tracking-[0.16em]" style={{ color: palette.muted }}>
              Multiplier / Faktor
            </div>
            {CURVES.map((curve, index) => {
              const multiplier = index + 1;
              const isActive = sortedActiveMultipliers.includes(multiplier);

              return (
                <button
                  key={curve.key}
                  type="button"
                  onClick={() => toggleMultiplier(multiplier)}
                  className="inline-flex h-8 min-w-[32px] items-center justify-center rounded-full border px-2 text-[9px] font-semibold uppercase tracking-[0.08em] transition-all duration-300"
                  style={{
                    borderColor: isActive ? "rgba(236,219,166,0.22)" : palette.panelBorder,
                    background: isActive
                      ? "linear-gradient(180deg, rgba(247,233,191,0.28), rgba(217,184,76,0.14))"
                      : "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015))",
                    color: isActive ? palette.heading : palette.muted,
                    boxShadow: isActive ? `0 0 18px rgba(236,219,166,0.16)` : "none",
                  }}
                >
                  {curve.label}
                </button>
              );
            })}
          </div>

          <div className="flex w-full min-w-0 max-w-full items-start gap-2 overflow-visible">
            <div className="min-w-0 basis-[78px] shrink-0 min-[390px]:basis-[88px]">
              <div
                className="flex h-8 w-full max-w-full items-center justify-center overflow-hidden rounded-[12px] border px-1 text-center text-[8px] font-semibold tracking-[0.01em] text-white min-[390px]:text-[9px] min-[769px]:text-[11px]"
                style={{ borderColor: "rgba(236,219,166,0.12)", background: "rgba(255,255,255,0.02)" }}
              >
                {formatDisplayDate(rangeStartDate)}
              </div>
            </div>

            <div className="min-w-0 flex-1 overflow-hidden chart-container">
              <div className="relative h-[52px] px-1.5">
                <div className="pointer-events-none absolute inset-x-2 top-[16px] h-[2px] rounded-full bg-white/10" />
                <div
                  className="pointer-events-none absolute top-[16px] h-[2px] rounded-full"
                  style={{
                    left: `calc(8px + ${rangeStartRatio} * (100% - 16px))`,
                    width: `calc(${rangeWidthRatio} * (100% - 16px))`,
                    background: "linear-gradient(90deg, rgba(247,233,191,0.95), rgba(217,184,76,0.82))",
                    boxShadow: "0 0 16px rgba(236,219,166,0.2)",
                  }}
                />
                <input
                  type="range"
                  min={0}
                  max={maxRangeIndex}
                  value={activeRangeStartIndex}
                  onChange={(event) => setRangeStartIndex(Math.min(Number(event.target.value), activeRangeEndIndex))}
                  className="performance-range performance-range-start absolute inset-x-0 top-0 h-10 w-full appearance-none bg-transparent"
                />
                <input
                  type="range"
                  min={0}
                  max={maxRangeIndex}
                  value={activeRangeEndIndex}
                  onChange={(event) => setRangeEndIndex(Math.max(Number(event.target.value), activeRangeStartIndex))}
                  className="performance-range performance-range-end absolute inset-x-0 top-0 h-10 w-full appearance-none bg-transparent"
                />
                <div className="pointer-events-none absolute inset-x-2 top-[37px] flex justify-between text-[6.5px] font-medium tracking-[0.08em]" style={{ color: "rgba(255,255,255,0.38)" }}>
                  <span>{formatDateInputValue(rangeStartDate).slice(2).replaceAll("-", ".")}</span>
                  <span>{formatDateInputValue(rangeEndDate).slice(2).replaceAll("-", ".")}</span>
                </div>
              </div>
            </div>

            <div className="min-w-0 basis-[78px] shrink-0 min-[390px]:basis-[88px]">
              <div
                className="flex h-8 w-full max-w-full items-center justify-center overflow-hidden rounded-[12px] border px-1 text-center text-[8px] font-semibold tracking-[0.01em] text-white min-[390px]:text-[9px] min-[769px]:text-[11px]"
                style={{ borderColor: "rgba(236,219,166,0.12)", background: "rgba(255,255,255,0.02)" }}
              >
                {formatDisplayDate(rangeEndDate)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-[1] flex h-[300px] min-h-[300px] flex-col overflow-hidden min-[390px]:h-[336px] min-[390px]:min-h-[336px] min-[769px]:h-[420px] min-[769px]:min-h-[420px]">
        {sortedActiveComparisons.length ? (
          <div className="mb-3 flex flex-wrap items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.14em]">
            {sortedActiveComparisons.map((comparison) => {
              const comparisonColor = getComparisonStroke(comparison.key, comparison.color);
              return (
                <span
                  key={`${comparison.id}-legend`}
                  className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1"
                  style={{
                    borderColor: "rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.02)",
                    color: palette.muted,
                  }}
                >
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: comparisonColor }} />
                  <span>{comparison.label}</span>
                </span>
              );
            })}
          </div>
        ) : null}
        <div className="chart-container relative min-h-0 flex-1 overflow-hidden">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={visibleChartData}
                margin={{
                  top: isMobileViewport ? 8 : 10,
                  right: isMobileViewport ? 84 : (activeLines.length > 3 ? 132 : 94),
                  left: isMobileViewport ? 0 : 0,
                  bottom: isMobileViewport ? 22 : 24,
                }}
              >
                <CartesianGrid stroke={palette.grid} strokeDasharray="2 10" vertical={false} />
                <XAxis
                  dataKey="date"
                  minTickGap={isMobileViewport ? 24 : 30}
                  tickMargin={isMobileViewport ? 10 : 14}
                  height={isMobileViewport ? 28 : 32}
                  stroke={palette.grid}
                  tick={{ fill: palette.muted, fontSize: isMobileViewport ? 9 : 10 }}
                />
                <YAxis
                  domain={[chartDomain.min, chartDomain.max]}
                  width={isMobileViewport ? 46 : 58}
                  tickMargin={isMobileViewport ? 6 : 8}
                  stroke={palette.grid}
                  tick={{ fill: palette.muted, fontSize: isMobileViewport ? 9 : 10 }}
                  tickFormatter={(value: number) => `${Math.round(value)}%`}
                />
                <Tooltip
                  allowEscapeViewBox={{ x: false, y: false }}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(8,9,11,0.94)",
                    boxShadow: "0 14px 28px rgba(0,0,0,0.36)",
                    padding: "8px 10px",
                  }}
                  wrapperStyle={{
                    maxWidth: isMobileViewport ? 112 : 140,
                    overflow: "hidden",
                  }}
                  itemStyle={{ color: palette.heading, fontSize: 11 }}
                  labelStyle={{ color: palette.muted, fontWeight: 600, fontSize: 10, marginBottom: 4 }}
                  labelFormatter={tooltipLabelFormatter}
                  formatter={(value, name) => [formatSignedPercent(Number(value ?? 0) / 100), String(name ?? "")]}
                />
                {activeLines.map((line, activeIndex) => (
                  <Line
                    key={line.id}
                    type={chartLineType}
                    dataKey={line.dataKey}
                    name={line.label}
                    stroke={line.stroke}
                    strokeWidth={line.width}
                    strokeOpacity={line.dashed ? 0.72 : 0.94}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={line.dashed ? "5 6" : undefined}
                    dot={createLastPointRenderer(line, activeIndex)}
                    activeDot={{ r: 3.25, fill: line.stroke, stroke: "#0b0f14", strokeWidth: 1.5 }}
                    isAnimationActive={false}
                    connectNulls
                    style={
                      line.glow
                        ? {
                            filter:
                              theme === "dark"
                                ? "drop-shadow(0 0 4px rgba(236,219,166,0.22))"
                                : "drop-shadow(0 0 4px rgba(255,255,255,0.18))",
                          }
                        : undefined
                    }
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full" />
          )}

        </div>

        <div className="pointer-events-none mt-1 flex justify-center px-3 min-[769px]:mt-2 min-[769px]:px-4">
          <img src={palette.watermarkLogo} alt="" className="h-6 w-auto max-w-[52%] opacity-100 brightness-110 min-[769px]:h-7" />
        </div>
      </div>
    </section>
  );
}
