"use client";

import { useEffect, useState } from "react";
import { Maximize2, Minimize2, RotateCw } from "lucide-react";

import { MONTH_LABELS, formatSignedPercent, type PerformanceRow, type TrackRecordTheme } from "@/components/track-record/metrics";
import { getTrackRecordThemePalette } from "@/components/track-record/theme";

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

type Props = {
  rows: PerformanceRow[];
  totalCumulativeReturn: number;
  activeMultiplier?: number;
  onMultiplierChange?: (multiplier: number) => void;
  theme: TrackRecordTheme;
};

function formatCompactSignedPercent(value: number): string {
  const pct = Number(value) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

export default function PerformanceTable({
  rows,
  totalCumulativeReturn,
  activeMultiplier,
  onMultiplierChange,
  theme,
}: Props) {
  const palette = getTrackRecordThemePalette(theme);
  const totalRowTone = totalCumulativeReturn >= 0 ? (theme === "blue" ? palette.success : palette.positive) : palette.negative;
  const isBlueTheme = theme === "blue";
  const headerBackground = isBlueTheme ? "rgba(255,255,255,0.02)" : palette.tableHeader;
  const rowBackground = "rgba(255,255,255,0.015)";
  const totalBackground = "rgba(255,255,255,0.02)";
  const displayMultiplier = Math.max(1, Number(activeMultiplier ?? 1));
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isLandscapeViewport, setIsLandscapeViewport] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRotated, setIsRotated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mobileMedia = window.matchMedia("(max-width: 768px)");
    const landscapeMedia = window.matchMedia("(orientation: landscape)");
    const legacyMobileMedia = mobileMedia as MediaQueryList & {
      addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
      removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
    };
    const legacyLandscapeMedia = landscapeMedia as MediaQueryList & {
      addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
      removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
    };
    const syncViewport = () => {
      const mobile = mobileMedia.matches;
      setIsMobileViewport(mobile);
      setIsLandscapeViewport(landscapeMedia.matches);
      if (!mobile) {
        setIsExpanded(false);
        setIsRotated(false);
      }
    };

    syncViewport();
    const onMobileChange = () => syncViewport();
    const onLandscapeChange = () => syncViewport();

    if ("addEventListener" in mobileMedia) {
      mobileMedia.addEventListener("change", onMobileChange);
      landscapeMedia.addEventListener("change", onLandscapeChange);
      return () => {
        mobileMedia.removeEventListener("change", onMobileChange);
        landscapeMedia.removeEventListener("change", onLandscapeChange);
      };
    }
    legacyMobileMedia.addListener?.(onMobileChange);
    legacyLandscapeMedia.addListener?.(onLandscapeChange);
    return () => {
      legacyMobileMedia.removeListener?.(onMobileChange);
      legacyLandscapeMedia.removeListener?.(onLandscapeChange);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!isExpanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) {
      setIsRotated(false);
    }
  }, [isExpanded]);

  const scaleValue = (value: number | null): number | null => {
    if (value == null) return null;
    return value * displayMultiplier;
  };

  const toneStyle = (value: number | null): { color: string } => {
    if (value == null) return { color: palette.muted };
    if (value > 0) return { color: theme === "blue" ? palette.success : palette.positive };
    if (value < 0) return { color: palette.negative };
    return { color: palette.neutral };
  };

  const monthCellLabel = (value: number | null) => {
    if (value == null) return "--";
    const scaled = scaleValue(value) ?? 0;
    return isMobileViewport ? formatCompactSignedPercent(scaled) : formatSignedPercent(scaled);
  };

  const mobileDense = isMobileViewport && !isExpanded && !isLandscapeViewport;
  const compactMode = isMobileViewport && !isLandscapeViewport;
  const yearColClass = mobileDense ? "w-[8%]" : compactMode ? "w-[8%]" : "w-[56px] min-[769px]:w-[64px]";
  const monthColClass = mobileDense ? "w-[5.5%]" : compactMode ? "w-[5.5%]" : "w-[44px] min-[769px]:w-auto";
  const totalColClass = mobileDense ? "w-[26%]" : compactMode ? "w-[26%]" : "w-[124px] min-[769px]:w-[146px] xl:w-[160px]";
  const monthHeaderClass = mobileDense
    ? "border-y px-0 py-2 text-center text-[5.5px] uppercase tracking-[0.04em]"
    : compactMode
      ? "border-y px-0 py-2 text-center text-[6.5px] uppercase tracking-[0.06em]"
      : "border-y px-0.5 py-2.5 text-center text-[6.5px] uppercase tracking-[0.1em] min-[769px]:px-1 min-[769px]:text-[8px]";
  const monthValueClass = mobileDense
    ? "border-y px-0 py-3 text-center text-[6px] font-semibold leading-none whitespace-nowrap"
    : compactMode
      ? "border-y px-0 py-3 text-center text-[7px] font-semibold leading-none whitespace-nowrap"
      : "border-y px-[2px] py-3 text-center text-[8px] font-semibold whitespace-nowrap min-[769px]:px-1 min-[769px]:text-[11px]";
  const yearCellClass = mobileDense
    ? "rounded-l-2xl border-y border-l px-1 py-3 text-[9px] font-semibold"
    : compactMode
      ? "rounded-l-2xl border-y border-l px-1.5 py-3 text-[10px] font-semibold"
      : "rounded-l-2xl border-y border-l px-1.5 py-3 text-[10px] font-semibold min-[769px]:px-2 min-[769px]:text-[12px]";
  const totalCellClass = mobileDense
    ? "rounded-r-2xl border-y border-r px-0.5 py-3 text-center text-[8px] font-semibold leading-none whitespace-nowrap"
    : compactMode
      ? "rounded-r-2xl border-y border-r px-1 py-3 text-center text-[9px] font-semibold leading-none whitespace-nowrap"
      : "rounded-r-2xl border-y border-r px-1 py-3 text-center text-[10px] font-semibold whitespace-nowrap min-[769px]:px-1.5 min-[769px]:text-[11px]";
  const totalRowValueClass = mobileDense
    ? "whitespace-nowrap text-[14px] font-semibold"
    : compactMode
      ? "whitespace-nowrap text-[16px] font-semibold"
      : "whitespace-nowrap text-[18px] font-semibold min-[769px]:text-[20px] xl:text-[22px]";

  const renderTableCard = (expanded = false) => (
    <section
      className={`relative overflow-hidden rounded-[28px] border p-[18px] min-[769px]:p-[22px] backdrop-blur-[18px] ${expanded ? "min-h-[calc(100dvh-24px)]" : ""}`}
      style={{
        background: [
          "linear-gradient(135deg, rgba(255,228,148,0.14) 0%, rgba(255,228,148,0.035) 24%, rgba(255,255,255,0.012) 46%, rgba(8,8,10,0) 72%)",
          HOME_GLASS_BACKGROUND,
        ].join(", "),
        borderColor: "rgba(236,219,166,0.16)",
        boxShadow: HOME_GLASS_SHADOW,
      }}
    >
      <div className="relative z-[1] mb-6 flex flex-col items-start gap-3 min-[769px]:flex-row min-[769px]:items-center min-[769px]:justify-between">
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: palette.accent }}>
            Data Layer
          </div>
          <div className="text-[14px] font-semibold tracking-[-0.02em]" style={{ color: palette.heading }}>
            Performance Table
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-2 min-[769px]:w-auto min-[769px]:justify-end">
          {onMultiplierChange ? (
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-[9px] font-semibold uppercase tracking-[0.16em]" style={{ color: palette.muted }}>
                Faktor
              </div>
              {[1, 2, 3, 4, 5].map((multiplier) => {
                const isActive = (activeMultiplier ?? 1) === multiplier;
                return (
                  <button
                  key={multiplier}
                  type="button"
                  onClick={() => onMultiplierChange(multiplier)}
                  className="inline-flex h-8 min-w-[36px] items-center justify-center rounded-full border px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] transition"
                  style={{
                    borderColor: isActive ? "rgba(236,219,166,0.2)" : palette.panelBorder,
                    background: isActive ? "rgba(236,219,166,0.08)" : "rgba(255,255,255,0.02)",
                    color: isActive ? palette.heading : palette.muted,
                    boxShadow: isActive ? `0 0 12px ${palette.panelGlow}` : "none",
                  }}
                >
                  {multiplier}x
                  </button>
                );
              })}
            </div>
          ) : <div />}
          {isMobileViewport ? (
            <div className="flex items-center gap-2">
              {expanded ? (
                <button
                  type="button"
                  onClick={() => setIsRotated((current) => !current)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border transition"
                  style={{
                    borderColor: isRotated ? "rgba(236,219,166,0.2)" : palette.panelBorder,
                    background: isRotated ? "rgba(236,219,166,0.08)" : "rgba(255,255,255,0.02)",
                    color: isRotated ? palette.heading : palette.muted,
                    boxShadow: isRotated ? `0 0 12px ${palette.panelGlow}` : "none",
                  }}
                  aria-label={isRotated ? "Reset table rotation" : "Rotate table 90 degrees"}
                  title={isRotated ? "Reset table rotation" : "Rotate table 90 degrees"}
                >
                  <RotateCw size={14} strokeWidth={1.8} />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setIsExpanded((current) => !current)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border transition"
                style={{
                  borderColor: expanded ? "rgba(236,219,166,0.2)" : palette.panelBorder,
                  background: expanded ? "rgba(236,219,166,0.08)" : "rgba(255,255,255,0.02)",
                  color: expanded ? palette.heading : palette.muted,
                  boxShadow: expanded ? `0 0 12px ${palette.panelGlow}` : "none",
                }}
                aria-label={expanded ? "Close table fullscreen" : "Open table fullscreen"}
                title={expanded ? "Close table fullscreen" : "Open table fullscreen"}
              >
                {expanded ? <Minimize2 size={14} strokeWidth={1.8} /> : <Maximize2 size={14} strokeWidth={1.8} />}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative z-[1] max-w-full overflow-hidden pb-1">
        <table className="w-full max-w-full table-fixed border-separate border-spacing-y-1 text-left tabular-nums min-[769px]:text-[10px] xl:text-[11px]">
          <colgroup>
            <col className={yearColClass} />
            {MONTH_LABELS.map((month) => (
              <col key={month} className={monthColClass} />
            ))}
            <col className={totalColClass} />
          </colgroup>
          <thead>
            <tr>
              <th
                className={`${mobileDense ? "rounded-l-2xl border-y border-l px-1 py-2 text-[6px] uppercase tracking-[0.08em]" : compactMode ? "rounded-l-2xl border-y border-l px-1.5 py-2 text-[6.5px] uppercase tracking-[0.1em]" : "rounded-l-2xl border-y border-l px-1.5 py-2.5 text-[7px] uppercase tracking-[0.14em] min-[769px]:px-2 min-[769px]:text-[8px]"}`}
                style={{ borderColor: palette.panelBorder, background: headerBackground, color: palette.muted }}
              >
                Year
              </th>
              {MONTH_LABELS.map((month) => (
                <th
                  key={month}
                  className={monthHeaderClass}
                  style={{ borderColor: palette.panelBorder, background: headerBackground, color: palette.muted }}
                >
                  {month}
                </th>
              ))}
              <th
                className={`${mobileDense ? "rounded-r-2xl border-y border-r px-0.5 py-2 text-center text-[6px] uppercase tracking-[0.08em]" : compactMode ? "rounded-r-2xl border-y border-r px-1 py-2 text-center text-[6.5px] uppercase tracking-[0.1em]" : "rounded-r-2xl border-y border-r px-1 py-2.5 text-center text-[7px] uppercase tracking-[0.12em] min-[769px]:px-1.5 min-[769px]:text-[8px]"}`}
                style={{ borderColor: palette.panelBorder, background: headerBackground, color: palette.muted }}
              >
                Total
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.year}>
                <td
                  className={`${yearCellClass} transition-colors duration-200 hover:bg-white/[0.03]`}
                  style={{ borderColor: palette.panelBorder, background: rowBackground, color: palette.heading }}
                >
                  {row.year}
                </td>
                {MONTH_LABELS.map((month) => {
                  const value = row.months[month];
                  return (
                    <td
                      key={`${row.year}-${month}`}
                      className={`${monthValueClass} transition-colors duration-200 hover:bg-white/[0.03]`}
                      style={{ borderColor: palette.panelBorder, background: rowBackground, ...toneStyle(scaleValue(value)) }}
                    >
                      {monthCellLabel(value)}
                    </td>
                  );
                })}
                <td
                  className={`${totalCellClass} transition-colors duration-200 hover:bg-white/[0.03]`}
                  style={{ borderColor: palette.panelBorder, background: rowBackground, ...toneStyle(scaleValue(row.total)) }}
                >
                  {row.total == null ? "--" : formatSignedPercent(scaleValue(row.total) ?? 0)}
                </td>
              </tr>
            ))}
            <tr>
              <td
                className={`${mobileDense ? "rounded-l-2xl border-y border-l px-1 py-3 text-[8px] font-semibold uppercase tracking-[0.04em] whitespace-nowrap" : compactMode ? "rounded-l-2xl border-y border-l px-1.5 py-3 text-[9px] font-semibold uppercase tracking-[0.05em] whitespace-nowrap" : "rounded-l-2xl border-y border-l px-1.5 py-3 font-semibold uppercase tracking-[0.06em] whitespace-nowrap min-[769px]:px-2"}`}
                style={{ borderColor: palette.panelBorder, background: totalBackground, color: palette.heading }}
              >
                Total Return
              </td>
              <td
                colSpan={12}
                className={`${mobileDense ? "border-y px-0.5 py-3" : compactMode ? "border-y px-1 py-3" : "border-y px-1 py-3 min-[769px]:px-1.5"}`}
                style={{ borderColor: palette.panelBorder, background: totalBackground, color: palette.muted }}
              />
              <td
                className={`${mobileDense ? "rounded-r-2xl border-y border-r py-3 pl-1 pr-4 text-right font-semibold leading-none" : compactMode ? "rounded-r-2xl border-y border-r py-3 pl-2 pr-5 text-right font-semibold leading-none" : "rounded-r-2xl border-y border-r py-3 pl-2 pr-4 text-right font-semibold leading-none min-[769px]:pl-3 min-[769px]:pr-5 xl:pr-6"}`}
                style={{ borderColor: palette.panelBorder, background: totalBackground, color: totalRowTone }}
              >
                <span className={totalRowValueClass}>
                  {formatSignedPercent(totalCumulativeReturn * displayMultiplier)}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );

  return (
    <>
      {renderTableCard(false)}
      {isExpanded ? (
        <div
          className="fixed inset-0 z-[12000] overflow-auto bg-[rgba(4,6,10,0.94)] p-3"
          style={{
            paddingTop: "max(12px, env(safe-area-inset-top))",
            paddingBottom: "max(12px, env(safe-area-inset-bottom))",
          }}
        >
          <div
            className={`mx-auto ${isRotated ? "flex min-h-[calc(100dvh-24px)] items-center justify-center" : "max-w-[min(100%,1180px)]"}`}
            style={
              isRotated
                ? {
                    width: "calc(100dvh - 24px)",
                    maxWidth: "calc(100dvh - 24px)",
                    transform: "rotate(90deg)",
                    transformOrigin: "center center",
                  }
                : undefined
            }
          >
            {renderTableCard(true)}
          </div>
        </div>
      ) : null}
    </>
  );
}
