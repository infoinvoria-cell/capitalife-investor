import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { stats } from "@/data/mock";

import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

const totalReturnStrategy = [100, 103, 107, 105, 110, 114, 113, 117, 118, 117.8, 121.5, 125];
const totalReturnSp = [100, 101.1, 100.4, 101.9, 103.1, 104.3, 105.0, 106.1, 106.8, 107.9, 108.7, 109.6];

const annualReturnStrategy = [100, 101.4, 103.3, 102.6, 104.9, 106.2, 105.7, 107.1, 108.5, 108.3, 109.4, 110.6];
const annualReturnSp = [100, 100.3, 100.1, 100.8, 101.1, 101.7, 101.6, 102.1, 102.4, 102.7, 102.9, 103.2];

const drawdownStrategy = [100, 95, 91, 94, 89, 86, 88, 85, 84.5, 84.7, 85.9, 87];
const drawdownSp = [100, 89, 81, 83, 76, 72, 74, 70, 68.4, 67.8, 69.1, 70.2];

type PathResult = {
  path: string;
  lastX: number;
  lastY: number;
};

function buildSmoothPath(
  values: number[],
  width = 100,
  height = 24,
  padding = 2,
  min?: number,
  max?: number
): PathResult {
  const safeMin = min ?? Math.min(...values);
  const safeMax = max ?? Math.max(...values);
  const range = safeMax - safeMin || 1;
  const stepX = (width - padding * 2) / (values.length - 1);
  const points = values.map((value, index) => {
    const x = padding + index * stepX;
    const y = height - padding - ((value - safeMin) / range) * (height - padding * 2);
    return { x, y };
  });

  let path = `M${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;

    path += ` Q${current.x.toFixed(2)} ${current.y.toFixed(2)} ${midX.toFixed(2)} ${midY.toFixed(2)}`;
  }

  const last = points[points.length - 1];
  path += ` T${last.x.toFixed(2)} ${last.y.toFixed(2)}`;

  return { path, lastX: last.x, lastY: last.y };
}

type WaveChartProps = {
  strategyValues: number[];
  strategyStroke: string;
  spValues: number[];
  delay: string;
  gradientId?: string;
  spStroke?: string;
  strategyIconSize?: number;
  spIconSize?: number;
  strategyIconOffsetX?: number;
  spIconOffsetX?: number;
};

function WaveChart({
  strategyValues,
  strategyStroke,
  spValues,
  delay,
  gradientId,
  spStroke = "#ff4d4f",
  strategyIconSize = 8.2,
  spIconSize = 7.6,
  strategyIconOffsetX = 5.2,
  spIconOffsetX = 5
}: WaveChartProps) {
  const strokeValue = gradientId ? `url(#${gradientId})` : strategyStroke;
  const min = Math.min(...strategyValues, ...spValues);
  const max = Math.max(...strategyValues, ...spValues);
  const strategyPath = buildSmoothPath(strategyValues, 100, 24, 2, min, max);
  const spPath = buildSmoothPath(spValues, 100, 24, 2, min, max);

  return (
    <svg viewBox="0 0 100 24" className="h-5 w-full overflow-visible">
      {gradientId ? (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ECDBA6" />
            <stop offset="100%" stopColor="#D9B84C" />
          </linearGradient>
        </defs>
      ) : null}
      <path
        d={spPath.path}
        pathLength={100}
        fill="none"
        stroke={spStroke}
        strokeOpacity="0.9"
        strokeWidth="1.5"
        strokeDasharray="5 4"
        strokeLinecap="butt"
        className="draw-curve-dashed"
        style={{ animationDelay: delay }}
      />
      <path
        d={strategyPath.path}
        pathLength={100}
        fill="none"
        stroke={strokeValue}
        strokeWidth="2.5"
        strokeLinecap="round"
        className="draw-curve"
        style={{ animationDelay: delay }}
      />

      <image
        href="/assets/brand/SP500.png"
        x={spPath.lastX + spIconOffsetX}
        y={spPath.lastY - spIconSize / 2}
        width={String(spIconSize)}
        height={String(spIconSize)}
        preserveAspectRatio="xMidYMid meet"
      />
      <image
        href="/assets/brand/CAPITALIFE_ICON.png"
        x={strategyPath.lastX + strategyIconOffsetX}
        y={strategyPath.lastY - strategyIconSize / 2}
        width={String(strategyIconSize)}
        height={String(strategyIconSize)}
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}

const items = [
  {
    label: "GESAMTRENDITE",
    labelClass: "text-[#ECDBA6]",
    value: `+${stats.totalReturn.toFixed(1)}%`,
    note: "S&P +32% | 36% schwaecher",
    tone: "text-[#ECDBA6]",
    chart: (
      <WaveChart
        strategyValues={totalReturnStrategy}
        strategyStroke="#ECDBA6"
        spValues={totalReturnSp}
        delay="0s"
        gradientId="total-return-gradient"
      />
    )
  },
  {
    label: "JAHRESRENDITE",
    labelClass: "text-white",
    value: `+${stats.annualReturn.toFixed(1)}%`,
    note: "S&P +16% | 16% schwaecher",
    tone: "text-white",
    chart: (
      <WaveChart
        strategyValues={annualReturnStrategy}
        strategyStroke="#FFFFFF"
        spValues={annualReturnSp}
        delay="1s"
      />
    )
  },
  {
    label: "VERLUSTPHASE",
    labelClass: "text-[#FF7A7A]",
    value: `${stats.maxDrawdown.toFixed(1)}%`,
    note: "S&P -19% | 8% schwaecher",
    tone: "text-[#FF7A7A]",
    chart: (
      <WaveChart
        strategyValues={drawdownStrategy}
        strategyStroke="#FF7A7A"
        spValues={drawdownSp}
        delay="2s"
        spStroke="#C8383A"
        strategyIconSize={8}
        spIconSize={7.2}
      />
    )
  }
];

export function KpiGrid() {
  return (
    <section>
      <Card className="relative space-y-2 p-3">
        <Link
          href="/track-record"
          className="section-arrow absolute right-3 top-3"
          aria-label="Zur Performance"
        >
          <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
        </Link>

        <SectionTitle
          eyebrow="Multiplikator 1 / Hebel 1"
          title="Verifizierte Live Performance der letzten 24 Monate"
        />

        <div className="grid grid-cols-3 gap-2">
          {items.map((item) => (
            <Card key={item.label} className="h-[96px] rounded-[16px] p-2">
              <div className="space-y-1.5">
                <h3
                  className={`whitespace-nowrap text-[8px] font-medium uppercase leading-none tracking-[0.08em] ${item.labelClass}`}
                >
                  {item.label}
                </h3>
                <p className={`text-[15px] font-semibold leading-none tracking-[-0.02em] ${item.tone}`}>
                  {item.value}
                </p>
                {item.chart}
                <p className="whitespace-nowrap text-[7px] leading-none text-[rgba(255,255,255,0.5)]">
                  {item.note}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </section>
  );
}
