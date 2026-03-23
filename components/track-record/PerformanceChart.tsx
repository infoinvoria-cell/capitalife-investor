"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

const CHART_MODE_OPTIONS: Array<{ value: ChartViewMode; label: string }> = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

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
  onRefreshData,
  isRefreshing = false,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [compareMenuOpen, setCompareMenuOpen] = useState(false);
  const compareMenuRef = useRef<HTMLDivElement | null>(null);
  const palette = getTrackRecordThemePalette(theme);
  const visibleChartData = useMemo(() => getChartDataForMode(chartData, chartMode), [chartData, chartMode]);
  const sortedActiveMultipliers = useMemo(() => [...activeMultipliers].sort((left, right) => left - right), [activeMultipliers]);
  const sortedActiveComparisons = useMemo(
    () => comparisonOptions.filter((option) => activeComparisons.includes(option.id)),
    [activeComparisons, comparisonOptions],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

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

  useEffect(() => {
    if (!compareMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!compareMenuRef.current) return;
      if (compareMenuRef.current.contains(event.target as Node)) return;
      setCompareMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [compareMenuOpen]);

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
      const labelWidth = Math.max(48, label.length * 6 + 14);
      const verticalOffset = (labelOffsetIndex - (activeLines.length - 1) / 2) * 15;

      return (
        <g>
          <circle cx={cx} cy={cy} r={2.75} fill={line.stroke} stroke="rgba(6,8,11,0.95)" strokeWidth={1.15} />
          <g transform={`translate(${cx + 8}, ${cy - 11 + verticalOffset})`}>
            <rect
              width={labelWidth}
              height={20}
              rx={6}
              fill="rgba(8,9,11,0.92)"
              stroke="rgba(255,255,255,0.08)"
            />
            <text x={labelWidth / 2} y={13} textAnchor="middle" fill={line.stroke} fontSize={9.5} fontWeight={700}>
              {label}
            </text>
          </g>
        </g>
      );
    }

    return LastPointRenderer;
  };

  const activeComparisonLabels = sortedActiveComparisons.map((comparison) => comparison.label);
  const compareButtonLabel = activeComparisons.length === 0
    ? "Compare"
    : activeComparisons.length <= 2
      ? activeComparisonLabels.join(" + ")
      : `Compare ${activeComparisons.length}`;
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
      className="relative flex h-full min-h-0 flex-col overflow-visible rounded-[28px] border px-[22px] pb-[22px] pt-[22px] backdrop-blur-[18px]"
      style={{
        background: palette.panelBackgroundStrong,
        borderColor: palette.panelBorder,
        boxShadow: palette.panelShadow,
      }}
    >
      <div className="relative z-[1] mb-6 flex flex-col items-start gap-4">
        <div className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: palette.accent }}>
            Performance
          </div>
          <div className="text-[14px] font-semibold tracking-[-0.02em] min-[769px]:text-[15px]" style={{ color: palette.heading }}>
            Track Record Overview
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 min-[769px]:flex-row min-[769px]:items-center min-[769px]:justify-between">
          <div
            className="inline-flex flex-wrap items-center gap-2 rounded-full border p-1"
            style={{ borderColor: palette.panelBorder, background: "rgba(255,255,255,0.02)" }}
          >
            {CHART_MODE_OPTIONS.map((option) => {
              const isActive = chartMode === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChartModeChange(option.value)}
                  className="rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition"
                  style={{
                    border: "1px solid transparent",
                    borderColor: isActive ? "rgba(236,219,166,0.22)" : "transparent",
                    background: isActive ? "rgba(236,219,166,0.08)" : "transparent",
                    boxShadow: isActive ? "0 0 14px rgba(236,219,166,0.08)" : "none",
                    color: isActive ? palette.heading : palette.muted,
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div
            className="relative z-[30]"
            ref={compareMenuRef}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={compareMenuOpen}
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={() => setCompareMenuOpen((current) => !current)}
              className="relative z-[31] flex h-8 cursor-pointer items-center justify-center rounded-full border px-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition"
              style={{
                borderColor: compareMenuOpen || activeComparisons.length > 0 ? "rgba(236,219,166,0.18)" : palette.panelBorder,
                background: compareMenuOpen || activeComparisons.length > 0 ? "rgba(236,219,166,0.06)" : "rgba(255,255,255,0.02)",
                color: activeComparisons.length > 0 ? palette.heading : palette.muted,
                boxShadow: compareMenuOpen || activeComparisons.length > 0 ? `0 0 12px ${palette.panelGlow}` : "none",
              }}
            >
              {compareButtonLabel}
            </button>
            {compareMenuOpen ? (
              <div
                className="absolute right-0 top-9 z-[40] min-w-[220px] rounded-[14px] border p-2 shadow-2xl"
                style={{ borderColor: palette.panelBorder, background: "rgba(6,10,16,0.96)" }}
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
              >
                <div className="mb-1.5 px-1 text-[9px] font-semibold uppercase tracking-[0.14em]" style={{ color: palette.muted }}>
                  Compare Assets
                </div>
                {comparisonOptions.map((comparison) => {
                  const isActive = activeComparisons.includes(comparison.id);
                  const comparisonColor = getComparisonStroke(comparison.key, comparison.color);
                  return (
                    <button
                      key={comparison.id}
                      type="button"
                      aria-pressed={isActive}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onClick={() => toggleComparison(comparison.id)}
                      className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-[10px] border px-2.5 py-2 text-left text-[11px] transition"
                      style={{
                        borderColor: isActive ? `${comparisonColor}88` : "transparent",
                        background: isActive ? `${comparisonColor}18` : "transparent",
                        color: isActive ? comparisonColor : palette.text,
                        opacity: comparison.isLoaded ? 1 : 0.78,
                        boxShadow: isActive ? `0 0 12px ${comparisonColor}22` : "none",
                      }}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: comparisonColor }} />
                        <span>{comparison.label}</span>
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <span style={{ color: isActive ? comparisonColor : palette.muted }}>
                          {comparison.isLoaded ? comparison.correlation.toFixed(2) : "Loading"}
                        </span>
                        <span
                          className="inline-flex min-w-[18px] items-center justify-center text-[12px] font-semibold"
                          style={{ color: isActive ? comparisonColor : palette.muted }}
                        >
                          {isActive ? "ON" : "+"}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          {onRefreshData ? (
            <button
              type="button"
              onClick={onRefreshData}
              className="inline-flex h-7 items-center justify-center rounded-full border px-3 text-[10px] font-semibold uppercase tracking-[0.12em] transition"
              style={{
                borderColor: palette.panelBorder,
                background: "rgba(255,255,255,0.02)",
                color: palette.muted,
              }}
            >
              {isRefreshing ? "Refreshing" : "Refresh"}
            </button>
          ) : null}

          {CURVES.map((curve, index) => {
            const multiplier = index + 1;
            const isActive = sortedActiveMultipliers.includes(multiplier);

            return (
              <button
                key={curve.key}
                type="button"
                onClick={() => toggleMultiplier(multiplier)}
                className="inline-flex h-8 min-w-[36px] items-center justify-center rounded-full border px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] transition"
                style={{
                  borderColor: isActive ? "rgba(236,219,166,0.2)" : palette.panelBorder,
                  background: isActive ? "rgba(236,219,166,0.08)" : "rgba(255,255,255,0.02)",
                  color: isActive ? palette.heading : palette.muted,
                  boxShadow: isActive ? `0 0 12px ${palette.panelGlow}` : "none",
                }}
              >
                {curve.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative z-[1] min-h-[348px] flex-1 overflow-visible pb-2 min-[769px]:min-h-[436px]">
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
        <div className="relative h-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={visibleChartData}
                margin={{
                  top: isMobileViewport ? 8 : 10,
                  right: isMobileViewport ? (activeLines.length > 3 ? 92 : 72) : (activeLines.length > 3 ? 120 : 84),
                  left: isMobileViewport ? -12 : -2,
                  bottom: isMobileViewport ? 24 : 16,
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
                  width={isMobileViewport ? 46 : 58}
                  tickMargin={isMobileViewport ? 6 : 8}
                  stroke={palette.grid}
                  tick={{ fill: palette.muted, fontSize: isMobileViewport ? 9 : 10 }}
                  tickFormatter={(value: number) => `${Math.round(value)}%`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(8,9,11,0.94)",
                    boxShadow: "0 14px 28px rgba(0,0,0,0.36)",
                    padding: "8px 10px",
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

          <div className="pointer-events-none absolute bottom-14 right-1 z-[2] min-[769px]:bottom-12 min-[769px]:right-3">
            <img src={palette.watermarkLogo} alt="" className="h-4 w-auto opacity-18 min-[769px]:h-7 min-[769px]:opacity-22" />
          </div>
        </div>
      </div>
    </section>
  );
}
