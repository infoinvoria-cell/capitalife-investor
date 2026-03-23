"use client";

import type { ReactNode } from "react";

import type { TrackRecordTheme } from "@/components/track-record/metrics";
import Sparkline from "@/components/track-record/Sparkline";
import { getTrackRecordThemePalette } from "@/components/track-record/theme";

type Tone = "positive" | "negative" | "neutral" | "success";

type Props = {
  title: string;
  value: string;
  footer?: string;
  sparkline?: number[];
  score?: number;
  rating?: string;
  tone?: Tone;
  theme: TrackRecordTheme;
  children?: ReactNode;
};

export default function KpiCard({
  title,
  value,
  footer,
  sparkline,
  score,
  rating,
  tone = "neutral",
  theme,
  children,
}: Props) {
  const palette = getTrackRecordThemePalette(theme);
  const sparkColor = tone === "negative" ? palette.negative : tone === "success" ? palette.success : palette.accent;
  const hasCustomContent = Boolean(children);
  const hasSparklineLayout = Boolean(!hasCustomContent && sparkline && score == null);
  const labelColor = theme === "dark" ? palette.accent : palette.heading;
  const valueColor =
    tone === "negative"
      ? palette.negative
      : tone === "success"
        ? palette.success
        : tone === "positive"
          ? palette.positive
          : palette.heading;

  return (
    <article
      className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[18px] border p-3.5 backdrop-blur-[18px] min-[769px]:p-4"
      style={{
        background: palette.panelBackground,
        borderColor: palette.panelBorder,
        boxShadow: palette.panelShadow,
      }}
    >
      <div className="relative z-[1] mb-2 flex items-start justify-between gap-2">
        <div>
          <div className="text-[8px] font-semibold uppercase tracking-[0.2em] min-[769px]:text-[9px]" style={{ color: labelColor }}>
            {title}
          </div>
          <div className="mt-2.5 text-[16px] font-semibold leading-none tracking-[-0.025em] min-[390px]:text-[18px] min-[769px]:text-[20px]" style={{ color: valueColor }}>
            {value}
          </div>
        </div>
        {rating ? (
          <div
            className="rounded-full border px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.14em]"
            style={{
              borderColor: theme === "dark" ? "rgba(236,219,166,0.16)" : "rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.03)",
              color: theme === "dark" ? "#f4e4b0" : "#ffffff",
            }}
          >
            {rating}
          </div>
        ) : null}
      </div>

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-visible">
        {children}

        {hasSparklineLayout ? (
          <div className="grid min-h-0 flex-1 grid-cols-1 items-center gap-2.5 min-[769px]:gap-3 min-[769px]:grid-cols-[minmax(0,1fr)_minmax(110px,0.92fr)]">
            <div className="min-w-0">
              <div className="text-[9px] leading-4 min-[769px]:text-[10px]" style={{ color: palette.muted }}>
                {footer}
              </div>
            </div>
            <div className="min-w-0">
              <Sparkline data={sparkline ?? []} color={sparkColor} negative={tone === "negative"} theme={theme} />
            </div>
          </div>
        ) : null}

        {!children && !hasSparklineLayout && sparkline ? (
          <Sparkline data={sparkline} color={sparkColor} negative={tone === "negative"} theme={theme} />
        ) : null}

        {score != null ? (
          <div className="mt-2.5 space-y-1.5">
            <div className="h-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${score}%`,
                  background: tone === "negative" ? palette.negative : palette.accent,
                }}
              />
            </div>
            <div className="flex items-center justify-between gap-3 text-[9px] font-semibold uppercase tracking-[0.14em]">
              <span style={{ color: palette.heading }}>{rating}</span>
              <span style={{ color: palette.muted }}>{score}/100</span>
            </div>
          </div>
        ) : null}

        {footer && !hasSparklineLayout ? (
          <div className={hasCustomContent ? "mt-auto pt-1.5 text-[9px] leading-4 min-[769px]:text-[10px]" : "mt-2 text-[9px] leading-4 min-[769px]:text-[10px]"} style={{ color: palette.muted }}>
            {footer}
          </div>
        ) : null}
      </div>
    </article>
  );
}
