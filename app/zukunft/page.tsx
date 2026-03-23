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
    <AppShell riskNote={<RiskDisclosure />} transitionClassName="page-stack pb-1">
      <TopBar />

      <Card className="app-section-card">
        <SectionTitle eyebrow="Zukunft" title="Zukunfts-Simulation" />
      </Card>

      <Card className="app-section-card">
        <div className="space-y-[18px]">
          <div>
            <p className="bg-[linear-gradient(90deg,#F7E9BF_0%,#ECDBA6_45%,#D9B84C_100%)] bg-clip-text text-[8px] font-semibold uppercase tracking-[0.2em] text-transparent">
              Kapital
            </p>
            <input
              type="range"
              min={1000}
              max={100000}
              step={1000}
              value={capital}
              onChange={(event) => setCapital(Number(event.target.value))}
              className="mt-3 w-full accent-[#D9B84C]"
            />
            <p className="mt-2 text-[15px] font-semibold tracking-[-0.02em] text-white">{capital.toLocaleString("de-DE")} EUR</p>
          </div>

          <div>
            <p className="bg-[linear-gradient(90deg,#F7E9BF_0%,#ECDBA6_45%,#D9B84C_100%)] bg-clip-text text-[8px] font-semibold uppercase tracking-[0.2em] text-transparent">
              Jahre
            </p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {[1, 2, 3, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setYears(value)}
                  data-active={years === value}
                  className="app-control-chip w-full px-2"
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="bg-[linear-gradient(90deg,#F7E9BF_0%,#ECDBA6_45%,#D9B84C_100%)] bg-clip-text text-[8px] font-semibold uppercase tracking-[0.2em] text-transparent">
              Multiplikator
            </p>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={multiplier}
              onChange={(event) => setMultiplier(Number(event.target.value))}
              className="mt-3 w-full accent-[#D9B84C]"
            />
            <p className="mt-2 text-[15px] font-semibold tracking-[-0.02em] text-white">x{multiplier}</p>
          </div>
        </div>
      </Card>

      <Card className="app-section-card">
        <div className="app-inner-panel px-4 py-3">
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 2, left: -22, bottom: 0 }}>
                <XAxis dataKey="step" stroke="rgba(255,255,255,0.28)" tickLine={false} axisLine={false} fontSize={9} />
                <YAxis hide domain={[8, 38]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 14,
                    border: "1px solid rgba(236,219,166,0.12)",
                    background: "rgba(10,10,10,0.94)",
                    color: "#ffffff",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.45)"
                  }}
                />
                <Line type="monotone" dataKey="optimistic" stroke="#66C26F" strokeWidth={2.1} strokeOpacity={0.92} dot={false} animationDuration={900} animationEasing="ease-out" />
                <Line type="monotone" dataKey="median" stroke="#FFFFFF" strokeWidth={2.15} strokeOpacity={0.98} dot={false} animationDuration={1050} animationEasing="ease-out" />
                <Line type="monotone" dataKey="pessimistic" stroke="#FF7A7A" strokeWidth={2.1} strokeOpacity={0.9} dot={false} animationDuration={1200} animationEasing="ease-out" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <Card className="app-section-card">
        <SectionTitle
          eyebrow="Ergebnis"
          title="Median outcome"
          subtitle={`Bei ${years} Jahren und Multiplikator x${multiplier} laege der Median bei rund ${medianOutcome.toLocaleString("de-DE")} EUR.`}
        />
      </Card>
    </AppShell>
  );
}
