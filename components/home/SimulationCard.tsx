import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

const optimistic = [100, 103.2, 101.9, 105.8, 104.9, 109.6, 111.4, 110.6, 115.9, 114.8, 119.7, 123.9];
const median = [100, 101.8, 100.9, 103.6, 102.8, 105.4, 106.1, 105.7, 108.1, 107.6, 109.9, 111.8];
const pessimistic = [100, 99.1, 100.2, 98.4, 97.7, 98.8, 97.2, 96.5, 97.1, 96.1, 98.3, 100];

function buildSmoothPath(
  values: number[],
  width = 122,
  height = 56,
  padding = 6,
  min?: number,
  max?: number
) {
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

  return path;
}

function buildPoints(values: number[], width = 122, height = 56, padding = 6, min?: number, max?: number) {
  const safeMin = min ?? Math.min(...values);
  const safeMax = max ?? Math.max(...values);
  const range = safeMax - safeMin || 1;
  const stepX = (width - padding * 2) / (values.length - 1);

  return values.map((value, index) => {
    const x = padding + index * stepX;
    const y = height - padding - ((value - safeMin) / range) * (height - padding * 2);
    return { x, y };
  });
}

export function SimulationCard() {
  const min = Math.min(...optimistic, ...median, ...pessimistic);
  const max = Math.max(...optimistic, ...median, ...pessimistic);
  const optimisticEnd = buildPoints(optimistic, 122, 56, 6, min, max).at(-1)!;
  const medianEnd = buildPoints(median, 122, 56, 6, min, max).at(-1)!;
  const pessimisticEnd = buildPoints(pessimistic, 122, 56, 6, min, max).at(-1)!;

  return (
    <section>
      <Card className="relative space-y-2 p-3">
        <Link
          href="/track-record"
          className="section-arrow absolute right-3 top-3"
          aria-label="Simulation \u00f6ffnen"
        >
          <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
        </Link>

        <SectionTitle eyebrow="Simulation" title={"Was w\u00e4re aus 10.000\u20ac geworden"} />

        <div className="grid h-[72px] grid-cols-[0.72fr_1.28fr] items-center gap-2 rounded-[16px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-3">
          <p className="max-w-[18ch] text-[10px] leading-[1.18] text-[rgba(255,255,255,0.62)]">
            <span className="block whitespace-nowrap">{"Monte-Carlo Simulation m\u00f6glicher"}</span>
            <span className="block whitespace-nowrap">{"Kapitalentwicklungen."}</span>
          </p>

          <svg viewBox="0 0 150 56" className="h-[56px] w-full overflow-visible">
            <path
              d={buildSmoothPath(optimistic, 122, 56, 6, min, max)}
              pathLength={100}
              fill="none"
              stroke="#66C26F"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="draw-curve monte-fade"
              style={{ animationDelay: "0.2s" }}
            />
            <path
              d={buildSmoothPath(median, 122, 56, 6, min, max)}
              pathLength={100}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="draw-curve monte-fade"
              style={{ animationDelay: "0.45s" }}
            />
            <path
              d={buildSmoothPath(pessimistic, 122, 56, 6, min, max)}
              pathLength={100}
              fill="none"
              stroke="#FF7A7A"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="draw-curve monte-fade"
              style={{ animationDelay: "0.7s" }}
            />

            <text x={Math.min(optimisticEnd.x + 8, 126)} y={optimisticEnd.y - 1} fill="#66C26F" fontSize="6" fontWeight="600" textAnchor="start">
              +15000 | +150%
            </text>
            <text x={Math.min(medianEnd.x + 8, 126)} y={medianEnd.y - 1} fill="#FFFFFF" fontSize="6" fontWeight="600" textAnchor="start">
              +3000 | +30%
            </text>
            <text x={Math.min(pessimisticEnd.x + 8, 126)} y={pessimisticEnd.y - 1} fill="#FF7A7A" fontSize="6" fontWeight="600" textAnchor="start">
              0 | 0%
            </text>
          </svg>
        </div>
      </Card>
    </section>
  );
}
