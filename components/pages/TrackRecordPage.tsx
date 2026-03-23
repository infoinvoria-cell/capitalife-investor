"use client";

import { useEffect, useMemo, useState } from "react";

import comparisonTimeseries from "@/data/track-record-comparison-timeseries.json";
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
      <div className="mx-auto flex h-full w-full max-w-[1720px] flex-col gap-6 pt-2" style={{ color: palette.text }}>
        <div className="grid h-full min-h-0 gap-6 xl:grid-cols-[minmax(0,1.58fr)_minmax(320px,0.86fr)]">
          <section className="grid min-h-0 gap-6 xl:grid-rows-[minmax(0,1fr)_auto]">
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
              <div
                className="app-badge min-[769px]:text-[9px]"
                style={{
                  borderColor: theme === "dark" ? "rgba(236,219,166,0.18)" : "rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.03)",
                  color: theme === "dark" ? "#f5e7bd" : "#dce8ff",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.18)"
                }}
              >
                Third Party Verified Track Record
              </div>
            </div>

            <PerformanceTable
              rows={model.performanceRows}
              totalCumulativeReturn={model.cumulativeReturn}
              activeMultiplier={tableMultiplier}
              onMultiplierChange={setTableMultiplier}
              theme={theme}
            />
          </section>

          <aside className="grid min-h-0 gap-6 xl:grid-rows-[minmax(0,0.58fr)_minmax(0,0.42fr)]">
            <div className="grid min-h-0 grid-cols-2 gap-2.5 xl:auto-rows-fr">
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

            <section
              className="relative flex min-h-0 flex-col overflow-hidden rounded-[28px] border p-[22px] backdrop-blur-[18px]"
              style={{
                background: palette.panelBackground,
                borderColor: palette.panelBorder,
                boxShadow: palette.panelShadow
              }}
            >
              <div className="relative z-[1] mb-6">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: palette.accent }}>
                    Trust Layer
                  </div>
                  <div className="mt-1 text-[14px] font-semibold tracking-[-0.02em]" style={{ color: palette.heading }}>
                    Risk & Efficiency Metrics
                  </div>
                  <p className="mt-1 text-[10px]" style={{ color: palette.muted }}>
                    Historical dataset through {model.historicalEndDate ? new Date(model.historicalEndDate).toLocaleDateString("en-GB") : "--"}
                  </p>
                </div>
              </div>

              <div className="relative z-[1] grid min-h-0 flex-1 grid-cols-2 gap-2.5 xl:auto-rows-fr">
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
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
