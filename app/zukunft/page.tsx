"use client";

import { useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AppShell } from "@/components/layout/AppShell";
import { RiskDisclosure } from "@/components/layout/RiskDisclosure";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

const optimisticCurve = [10, 14, 20, 27, 36];
const medianCurve = [10, 13, 17, 22, 28];
const pessimisticCurve = [10, 11, 13, 15, 17];

export default function ZukunftPage() {
  const [capital, setCapital] = useState(10000);
  const [years, setYears] = useState(3);
  const [multiplier, setMultiplier] = useState(2);

  const chartData = useMemo(
    () =>
      optimisticCurve.map((_, index) => ({
        step: `${index + 1}`,
        optimistic: optimisticCurve[index],
        median: medianCurve[index],
        pessimistic: pessimisticCurve[index]
      })),
    []
  );

  const medianOutcome = Math.round(capital * (medianCurve[years - 1] / 10) * (multiplier / 1.5));

  return (
    <AppShell riskNote={<RiskDisclosure />}>
      <TopBar />

      <Card className="p-3">
        <SectionTitle eyebrow="Zukunft" title="Zukunfts-Simulation" />
      </Card>

      <Card className="p-3">
        <div className="space-y-3">
          <div>
            <p className="text-[8px] font-medium uppercase tracking-[0.08em] text-[rgba(255,255,255,0.58)]">
              Kapital
            </p>
            <input
              type="range"
              min={1000}
              max={100000}
              step={1000}
              value={capital}
              onChange={(event) => setCapital(Number(event.target.value))}
              className="mt-2 w-full accent-[#D9B84C]"
            />
            <p className="mt-1 text-[12px] font-semibold text-white">{capital.toLocaleString("de-DE")} EUR</p>
          </div>

          <div>
            <p className="text-[8px] font-medium uppercase tracking-[0.08em] text-[rgba(255,255,255,0.58)]">
              Jahre
            </p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {[1, 2, 3, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setYears(value)}
                  className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${
                    years === value
                      ? "border-[#D9B84C] bg-[#D9B84C] text-black"
                      : "border-white/10 bg-white/[0.02] text-white/70"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[8px] font-medium uppercase tracking-[0.08em] text-[rgba(255,255,255,0.58)]">
              Multiplikator
            </p>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={multiplier}
              onChange={(event) => setMultiplier(Number(event.target.value))}
              className="mt-2 w-full accent-[#D9B84C]"
            />
            <p className="mt-1 text-[12px] font-semibold text-white">x{multiplier}</p>
          </div>
        </div>
      </Card>

      <Card className="p-3">
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 2, left: -22, bottom: 0 }}>
              <XAxis dataKey="step" stroke="rgba(255,255,255,0.28)" tickLine={false} axisLine={false} fontSize={9} />
              <YAxis hide domain={[8, 38]} />
              <Tooltip
                contentStyle={{
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(10,10,10,0.94)",
                  color: "#ffffff"
                }}
              />
              <Line type="monotone" dataKey="optimistic" stroke="#66C26F" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="median" stroke="#FFFFFF" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="pessimistic" stroke="#FF7A7A" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-3">
        <SectionTitle
          eyebrow="Ergebnis"
          title="Median outcome"
          subtitle={`Bei ${years} Jahren und Multiplikator x${multiplier} laege der Median bei rund ${medianOutcome.toLocaleString("de-DE")} EUR.`}
        />
      </Card>
    </AppShell>
  );
}
