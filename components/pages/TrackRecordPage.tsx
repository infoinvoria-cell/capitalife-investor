"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, ChevronDown, ChevronUp } from "lucide-react";

import comparisonTimeseries from "@/data/track-record-comparison-timeseries.json";
import { PartnerMarquee } from "@/components/home/PartnerMarquee";
import DonutChart from "@/components/track-record/DonutChart";
import KpiCard from "@/components/track-record/KpiCard";
import PerformanceChart from "@/components/track-record/PerformanceChart";
import PerformanceTable from "@/components/track-record/PerformanceTable";
import type {
  ChartViewMode,
  ComparisonAssetId,
  ComparisonSeries,
  TrackRecordModel,
  TrackRecordTheme
} from "@/components/track-record/metrics";
import {
  buildComparisonSeriesFromCloses,
  formatRatio,
  formatSignedPercent,
  getMetricRating,
  getRiskMetricScore,
  mergeComparisonSeriesIntoChartData,
  TRACK_RECORD_COMPARISON_ASSETS
} from "@/components/track-record/metrics";
import { getTrackRecordThemePalette } from "@/components/track-record/theme";

type Props = {
  initialModel: TrackRecordModel;
};

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

function comparisonPayloadForAsset(assetId: ComparisonAssetId) {
  return comparisonTimeseries[assetId] ?? null;
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export default function TrackRecordPage({ initialModel }: Props) {
  const [activeMultipliers, setActiveMultipliers] = useState<number[]>([1]);
  const [activeComparisons, setActiveComparisons] = useState<ComparisonAssetId[]>([]);
  const [chartMode, setChartMode] = useState<ChartViewMode>("monthly");
  const [tableMultiplier, setTableMultiplier] = useState<number>(1);
  const [theme, setTheme] = useState<TrackRecordTheme>("dark");
  const [comparisonSeries, setComparisonSeries] = useState<ComparisonSeries[]>([]);
  const [isRefreshingComparisons, setIsRefreshingComparisons] = useState(false);
  const [showHeadlineMetrics, setShowHeadlineMetrics] = useState(false);
  const [showRiskMetrics, setShowRiskMetrics] = useState(false);
  const palette = getTrackRecordThemePalette(theme);
  const model = initialModel;

  const tradeOutcomeSegments = useMemo(
    () => [
      { label: "Winning", value: model.winningTrades, color: palette.accent },
      {
        label: "Losing",
        value: model.losingTrades,
        color: theme === "dark" ? "#3a4250" : "#2a3f6a"
      }
    ],
    [model.losingTrades, model.winningTrades, palette.accent, theme]
  );

  const directionSegments = useMemo(
    () => [
      { label: "Long", value: model.longTrades, color: palette.accent },
      {
        label: "Short",
        value: model.shortTrades,
        color: theme === "dark" ? "#dfe8ff" : "#b8d0ff"
      }
    ],
    [model.longTrades, model.shortTrades, palette.accent, theme]
  );

  useEffect(() => {
    const readTheme = () => {
      try {
        const stored = window.localStorage.getItem("ivq_globe_gold_theme_v1");
        setTheme(stored === "0" ? "blue" : "dark");
      } catch {
        setTheme("dark");
      }
    };

    const onThemeEvent = (event: Event) => {
      const custom = event as CustomEvent<{ theme?: string; themeCanonical?: string }>;
      const canonical = String(custom.detail?.themeCanonical || "").toLowerCase();
      const legacy = String(custom.detail?.theme || "").toLowerCase();
      if (canonical === "blue" || legacy === "blue") {
        setTheme("blue");
        return;
      }
      if (canonical === "black" || legacy === "black" || legacy === "gold") {
        setTheme("dark");
      }
    };

    readTheme();
    window.addEventListener("invoria-theme-set", onThemeEvent as EventListener);
    return () => {
      window.removeEventListener("invoria-theme-set", onThemeEvent as EventListener);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadComparisons = () => {
      const results = TRACK_RECORD_COMPARISON_ASSETS.map((asset) => {
        const payload = comparisonPayloadForAsset(asset.id);
        if (!payload?.ohlcv?.length) {
          return null;
        }
        return buildComparisonSeriesFromCloses(model.chartData, payload.ohlcv, asset.id);
      });

      if (cancelled) return;
      const next = results.filter((item): item is ComparisonSeries => item != null);
      setComparisonSeries(next);
    };

    loadComparisons();

    return () => {
      cancelled = true;
    };
  }, [model.chartData]);

  const handleRefreshComparisons = () => {
    setIsRefreshingComparisons(true);
    try {
      const results = TRACK_RECORD_COMPARISON_ASSETS.map((asset) => {
        const payload = comparisonPayloadForAsset(asset.id);
        if (!payload?.ohlcv?.length) {
          return null;
        }
        return buildComparisonSeriesFromCloses(model.chartData, payload.ohlcv, asset.id);
      });
      const next = results.filter((item): item is ComparisonSeries => item != null);
      setComparisonSeries(next);
    } finally {
      setIsRefreshingComparisons(false);
    }
  };

  const chartDataWithComparisons = useMemo(
    () =>
      mergeComparisonSeriesIntoChartData(
        model.chartData,
        Object.fromEntries(comparisonSeries.map((series) => [series.key, series.values])) as Record<
          ComparisonSeries["key"],
          number[]
        >
      ),
    [comparisonSeries, model.chartData]
  );

  const comparisonOptions = useMemo(
    () =>
      TRACK_RECORD_COMPARISON_ASSETS.map((asset) => {
        const series = comparisonSeries.find((entry) => entry.id === asset.id);
        return {
          id: asset.id,
          key: asset.key,
          label: asset.label,
          shortLabel: asset.shortLabel,
          correlation: series?.correlation ?? 0,
          isLoaded: Boolean(series)
        };
      }),
    [comparisonSeries]
  );

  const headlineCards = useMemo(
    () => [
      {
        title: "Total Return",
        value: formatSignedPercent(model.cumulativeReturn),
        sparkline: model.sparklineSeries.cumulativeReturn,
        footer: `${model.trades} trades`,
        tone: "positive" as const
      },
      {
        title: "Max Drawdown",
        value: formatSignedPercent(-model.maxDrawdown),
        sparkline: model.sparklineSeries.drawdownDepth,
        footer: "Worst peak-to-trough drawdown",
        tone: "negative" as const
      },
      {
        title: "Average Drawdown",
        value: formatSignedPercent(-model.averageDrawdown),
        sparkline: model.sparklineSeries.averageDrawdown,
        footer: "Mean active drawdown depth",
        tone: "negative" as const
      },
      {
        title: "Average Winning Trade",
        value: formatSignedPercent(model.averageWinningTrade),
        sparkline: model.sparklineSeries.rollingAverageWin,
        footer: "Mean positive trade result",
        tone: "positive" as const
      }
    ],
    [model]
  );

  const annualAverageScore = Math.max(
    0,
    Math.min(100, Math.round((Math.abs(model.annualAverageReturn) / 0.4) * 100))
  );

  const riskCards = useMemo(
    () =>
      [
        {
          title: "Profit Factor",
          value: formatRatio(model.profitFactor),
          score: getRiskMetricScore("profitFactor", model.profitFactor)
        },
        {
          title: "Expectancy",
          value: formatSignedPercent(model.expectancy),
          score: getRiskMetricScore("expectancy", model.expectancy)
        },
        {
          title: "Sharpe Ratio",
          value: formatRatio(model.sharpeRatio),
          score: getRiskMetricScore("sharpeRatio", model.sharpeRatio)
        },
        {
          title: "Sortino Ratio",
          value: formatRatio(model.sortinoRatio),
          score: getRiskMetricScore("sortinoRatio", model.sortinoRatio)
        },
        {
          title: "Calmar Ratio",
          value: formatRatio(model.calmarRatio),
          score: getRiskMetricScore("calmarRatio", model.calmarRatio)
        },
        {
          title: "Omega Ratio",
          value: formatRatio(model.omegaRatio),
          score: getRiskMetricScore("omegaRatio", model.omegaRatio)
        }
      ].map((item) => ({
        ...item,
        rating: getMetricRating(item.score)
      })),
    [model]
  );

  return (
    <main className="ivq-terminal-page ivq-track-record-page">
      <div className="performance-page mx-auto flex w-full min-w-0 max-w-[1720px] flex-col gap-6 pt-2" style={{ color: palette.text }}>
        <div className="performance-content flex min-w-0 flex-col gap-6 xl:grid xl:grid-cols-[minmax(0,1.58fr)_minmax(320px,0.86fr)]">
          <section className="flex min-w-0 flex-col gap-6">
            <PerformanceChart
              chartData={chartDataWithComparisons}
              activeMultipliers={activeMultipliers}
              onMultiplierChange={setActiveMultipliers}
              chartMode={chartMode}
              onChartModeChange={setChartMode}
              comparisonOptions={comparisonOptions}
              activeComparisons={activeComparisons}
              onComparisonChange={setActiveComparisons}
              theme={theme}
              onRefreshData={handleRefreshComparisons}
              isRefreshing={isRefreshingComparisons}
            />

            <div className="flex justify-center px-2">
              <div className="flex items-center gap-2">
                <div
                  className="inline-flex h-9 items-center gap-2 rounded-full border px-3 text-[8px] font-semibold uppercase tracking-[0.08em] min-[769px]:h-10 min-[769px]:text-[9px]"
                  style={{
                    borderColor: theme === "dark" ? "rgba(236,219,166,0.24)" : "rgba(255,255,255,0.18)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)), linear-gradient(135deg, rgba(255,228,148,0.12), rgba(255,228,148,0.03))",
                    color: theme === "dark" ? "#f5e7bd" : "#dce8ff",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.22), 0 0 22px rgba(236,219,166,0.18)"
                  }}
                >
                  <BadgeCheck
                    className="h-4.5 w-4.5 shrink-0 min-[769px]:h-5 min-[769px]:w-5"
                    strokeWidth={1.9}
                    style={{ filter: "drop-shadow(0 0 10px rgba(236,219,166,0.22))" }}
                  />
                  Third Party Verified Track Record
                </div>
              </div>
            </div>

            <PerformanceTable
              rows={model.performanceRows}
              totalCumulativeReturn={model.cumulativeReturn}
              activeMultiplier={tableMultiplier}
              onMultiplierChange={setTableMultiplier}
              theme={theme}
            />

            <PartnerMarquee
              items={[
                { src: "/assets/logos/copyfx.png", alt: "CopyFX" },
                { src: "/assets/logos/darwin.png", alt: "Darwinex" },
                { src: "/assets/logos/myfxbook.png", alt: "Myfxbook" },
                { src: "/assets/logos/roboforex.png", alt: "RoboForex" },
              ]}
            />
          </section>

          <aside className="flex min-w-0 flex-col gap-4">
            <section
              className="relative overflow-hidden rounded-[24px] border p-[18px] backdrop-blur-[18px]"
              style={{
                background: HOME_GLASS_BACKGROUND,
                borderColor: "rgba(236,219,166,0.16)",
                boxShadow: HOME_GLASS_SHADOW
              }}
            >
              <button
                type="button"
                onClick={() => setShowHeadlineMetrics((value) => !value)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: palette.accent }}>
                    Data Layer
                  </div>
                  <div className="mt-1 text-[14px] font-semibold tracking-[-0.02em]" style={{ color: palette.heading }}>
                    KPI Statistiken
                  </div>
                </div>
                {showHeadlineMetrics ? (
                  <ChevronUp className="h-4 w-4 shrink-0" style={{ color: palette.heading }} />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0" style={{ color: palette.heading }} />
                )}
              </button>

              {showHeadlineMetrics ? (
                <div className="mt-4 grid min-h-0 grid-cols-2 gap-2.5 xl:auto-rows-fr">
                  <KpiCard
                    title="Annual Avg Return"
                    value={formatSignedPercent(model.annualAverageReturn)}
                    footer="Compounded yearly average"
                    tone={model.annualAverageReturn >= 0 ? "positive" : "negative"}
                    theme={theme}
                  >
                    <div className="grid min-h-[86px] grid-cols-[minmax(0,1fr)_54px] items-start gap-2 min-[769px]:grid-cols-[minmax(0,1fr)_78px] min-[769px]:gap-3">
                      <div className="space-y-1 text-[9px] leading-[1.12] min-[769px]:space-y-1.5 min-[769px]:text-[10px]" style={{ color: palette.muted }}>
                        <div>Annualisiert auf 12 Monate</div>
                        <div className="text-[8px] min-[769px]:text-[9px]" style={{ color: palette.heading }}>
                          Skala 0% bis 40%
                        </div>
                        <div className="text-[8px] min-[769px]:text-[9px]" style={{ color: model.annualAverageReturn >= 0 ? palette.positive : palette.negative }}>
                          Zielwert {formatSignedPercent(model.annualAverageReturn)}
                        </div>
                      </div>
                      <div className="grid grid-cols-[auto_20px] items-start gap-1.5 justify-self-end min-[769px]:grid-cols-[auto_28px] min-[769px]:gap-2">
                        <div className="flex h-[62px] flex-col items-end justify-between text-[7px] font-semibold uppercase tracking-[0.08em] min-[769px]:h-[78px] min-[769px]:text-[8px]" style={{ color: palette.muted }}>
                          <span>40</span>
                          <span>20</span>
                          <span>0</span>
                        </div>
                        <div className="relative h-[62px] w-[20px] overflow-hidden rounded-full border min-[769px]:h-[78px] min-[769px]:w-[28px]" style={{ borderColor: palette.panelBorder, background: "rgba(255,255,255,0.04)" }}>
                          <div
                            className="absolute bottom-0 inset-x-[3px] rounded-full min-[769px]:inset-x-[4px]"
                            style={{
                              height: `${annualAverageScore}%`,
                              background:
                                model.annualAverageReturn >= 0
                                  ? theme === "dark"
                                    ? "linear-gradient(180deg, #fff4d6 0%, #d6c38f 55%, #9e7b3f 100%)"
                                    : "linear-gradient(180deg, #dce8ff 0%, #78a8ff 55%, #315dc5 100%)"
                                  : "linear-gradient(180deg, #ffcacb 0%, #e05656 100%)",
                              boxShadow:
                                model.annualAverageReturn >= 0
                                  ? `0 0 16px ${palette.panelGlow}`
                                  : "0 0 16px rgba(224,86,86,0.24)"
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </KpiCard>

                  {headlineCards.map((card) => (
                    <KpiCard
                      key={card.title}
                      title={card.title}
                      value={card.value}
                      sparkline={card.sparkline}
                      footer={card.footer}
                      tone={card.tone}
                      theme={theme}
                    />
                  ))}

                  <KpiCard title="Winrate" value={formatPercent(model.winRate)} footer={`${model.winningTrades} winning trades`} theme={theme}>
                    <div className="grid min-h-[84px] grid-cols-[minmax(0,1fr)_54px] items-start gap-2 pt-0 min-[769px]:grid-cols-[minmax(0,1fr)_72px] min-[769px]:gap-2.5">
                      <div className="min-w-0 space-y-1 text-[9px] leading-[1.08] min-[769px]:text-[10px]" style={{ color: palette.muted }}>
                        <div>{model.winningTrades} winning trades</div>
                        <div>{model.losingTrades} losing trades</div>
                        <div className="pt-0.5 text-[8px] leading-[1.12] min-[769px]:text-[9px]" style={{ color: palette.heading }}>
                          Strike rate {formatPercent(model.winRate)}
                        </div>
                      </div>
                      <div className="h-[52px] w-[52px] justify-self-end self-start min-[769px]:-translate-y-1 min-[769px]:h-[70px] min-[769px]:w-[70px]">
                        <DonutChart
                          segments={tradeOutcomeSegments}
                          centerLabel="Win"
                          centerValue={formatPercent(model.winRate)}
                          theme={theme}
                        />
                      </div>
                    </div>
                  </KpiCard>

                  <KpiCard title="Trades" value={String(model.trades)} footer={model.tradeBreakdownText} theme={theme}>
                    <div className="grid min-h-[88px] grid-cols-[minmax(0,1fr)_54px] items-start gap-2 pt-0 min-[769px]:grid-cols-[minmax(0,1fr)_72px] min-[769px]:gap-2.5">
                      <div className="min-w-0 space-y-0.5 text-[8px] leading-[1.02] min-[769px]:text-[9px]" style={{ color: palette.muted }}>
                        {model.tradesByYear.map((entry) => (
                          <div key={entry.year} className="grid grid-cols-[auto_1fr] items-baseline gap-x-2">
                            <span>{entry.year}</span>
                            <span className="justify-self-end font-semibold leading-none" style={{ color: palette.heading }}>
                              {entry.count}
                            </span>
                          </div>
                        ))}
                        <div className="pt-1 text-[8px] leading-[1.08] min-[769px]:text-[9px]">
                          {model.winningTrades} winners / {model.losingTrades} losers
                        </div>
                      </div>
                      <div className="h-[52px] w-[52px] justify-self-end self-start min-[769px]:-translate-y-1 min-[769px]:h-[70px] min-[769px]:w-[70px]">
                        <DonutChart segments={tradeOutcomeSegments} centerLabel="Trades" centerValue={String(model.trades)} theme={theme} />
                      </div>
                    </div>
                  </KpiCard>

                  <KpiCard
                    title="Long / Short Ratio"
                    value={`${model.longTrades} / ${model.shortTrades}`}
                    footer={`Ratio ${model.longShortRatio.toFixed(2)}x`}
                    theme={theme}
                  >
                    <div className="grid min-h-[84px] grid-cols-[minmax(0,1fr)_54px] items-start gap-2 pt-0 min-[769px]:grid-cols-[minmax(0,1fr)_72px] min-[769px]:gap-2.5">
                      <div className="min-w-0 space-y-1 text-[9px] leading-[1.08] min-[769px]:text-[10px]">
                        <div style={{ color: palette.text }}>
                          Long <span style={{ color: palette.accent }}>{model.longTrades}</span>
                        </div>
                        <div style={{ color: palette.text }}>
                          Short <span style={{ color: palette.accentSoft }}>{model.shortTrades}</span>
                        </div>
                        <div className="pt-0.5 text-[8px] leading-[1.12] min-[769px]:text-[9px]" style={{ color: palette.muted }}>
                          Ratio {model.longShortRatio.toFixed(2)}x
                        </div>
                      </div>
                      <div className="h-[52px] w-[52px] justify-self-end self-start min-[769px]:-translate-y-1 min-[769px]:h-[70px] min-[769px]:w-[70px]">
                        <DonutChart
                          segments={directionSegments}
                          centerLabel="L / S"
                          centerValue={`${model.longTrades}/${model.shortTrades}`}
                          theme={theme}
                        />
                      </div>
                    </div>
                  </KpiCard>
                </div>
              ) : null}
            </section>

            <section
              className="relative overflow-hidden rounded-[24px] border p-[18px] backdrop-blur-[18px]"
              style={{
                background: HOME_GLASS_BACKGROUND,
                borderColor: "rgba(236,219,166,0.16)",
                boxShadow: HOME_GLASS_SHADOW
              }}
            >
              <button
                type="button"
                onClick={() => setShowRiskMetrics((value) => !value)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: palette.accent }}>
                    Trust Layer
                  </div>
                  <div className="mt-1 text-[14px] font-semibold tracking-[-0.02em]" style={{ color: palette.heading }}>
                    Risk & Efficiency Metrics
                  </div>
                </div>
                {showRiskMetrics ? (
                  <ChevronUp className="h-4 w-4 shrink-0" style={{ color: palette.heading }} />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0" style={{ color: palette.heading }} />
                )}
              </button>

              {showRiskMetrics ? (
                <>
                  <p className="mt-3 text-[10px]" style={{ color: palette.muted }}>
                    Historical dataset through {model.historicalEndDate ? new Date(model.historicalEndDate).toLocaleDateString("en-GB") : "--"}
                  </p>

                  <div className="mt-4 grid min-h-0 grid-cols-2 gap-2.5 xl:auto-rows-fr">
                    {riskCards.map((card) => (
                      <KpiCard
                        key={card.title}
                        title={card.title}
                        value={card.value}
                        score={card.score}
                        rating={card.rating}
                        tone="neutral"
                        theme={theme}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
