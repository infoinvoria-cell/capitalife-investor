"use client";

import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { AppShell } from "@/components/layout/AppShell";
import { RiskDisclosure } from "@/components/layout/RiskDisclosure";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

const equitySeries = [
  { month: "M1", strategy: 100, sp500: 100, drawdown: 0 },
  { month: "M2", strategy: 102, sp500: 101, drawdown: -2 },
  { month: "M3", strategy: 104, sp500: 100, drawdown: -1 },
  { month: "M4", strategy: 103, sp500: 102, drawdown: -3 },
  { month: "M5", strategy: 106, sp500: 103, drawdown: -2 },
  { month: "M6", strategy: 108, sp500: 104, drawdown: -4 },
  { month: "M7", strategy: 110, sp500: 105, drawdown: -3 },
  { month: "M8", strategy: 109, sp500: 106, drawdown: -2 },
  { month: "M9", strategy: 112, sp500: 107, drawdown: -1 },
  { month: "M10", strategy: 115, sp500: 108, drawdown: -2 },
  { month: "M11", strategy: 118, sp500: 109, drawdown: -1 },
  { month: "M12", strategy: 120, sp500: 109, drawdown: 0 }
];

const monthlySeries = [
  { month: "Jan", value: 2.1 },
  { month: "Feb", value: 1.3 },
  { month: "Mrz", value: -0.8 },
  { month: "Apr", value: 2.7 },
  { month: "Mai", value: 1.9 },
  { month: "Jun", value: -1.4 },
  { month: "Jul", value: 2.3 },
  { month: "Aug", value: 1.1 },
  { month: "Sep", value: -0.6 },
  { month: "Okt", value: 2.8 },
  { month: "Nov", value: 1.6 },
  { month: "Dez", value: 1.2 }
];

const kpis = [
  { label: "Total Return", value: "+68.6%" },
  { label: "Annual", value: "+31.9%" },
  { label: "Max DD", value: "-10.9%", tone: "text-[#FF7A7A]" },
  { label: "Sharpe", value: "1.8" }
];

const risks = [
  { label: "Worst Month", value: "-4.2%" },
  { label: "Recovery", value: "21 days" },
  { label: "Risk Level", value: "Moderate" }
];

export default function TrackRecordPage() {
  return (
    <AppShell riskNote={<RiskDisclosure />}>
      <TopBar />

      <Card className="p-3">
        <SectionTitle eyebrow="Live Performance" title="Verifizierte Performance seit Start" />
      </Card>

      <Card className="p-3">
        <div className="mb-2 h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={equitySeries} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="performanceStrategy" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ECDBA6" />
                  <stop offset="100%" stopColor="#D9B84C" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tickLine={false} axisLine={false} fontSize={9} />
              <YAxis yAxisId="equity" hide domain={[98, 122]} />
              <YAxis yAxisId="drawdown" hide domain={[-5, 1]} />
              <Tooltip
                contentStyle={{
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(10,10,10,0.94)",
                  color: "#ffffff"
                }}
              />
              <ReferenceLine yAxisId="drawdown" y={0} stroke="rgba(255,255,255,0.08)" />
              <Bar yAxisId="drawdown" dataKey="drawdown" fill="rgba(255,77,79,0.16)" radius={[3, 3, 0, 0]} />
              <Line yAxisId="equity" type="monotone" dataKey="strategy" stroke="url(#performanceStrategy)" strokeWidth={2.4} dot={false} />
              <Line
                yAxisId="equity"
                type="monotone"
                dataKey="sp500"
                stroke="#ff4d4f"
                strokeWidth={2}
                strokeDasharray="6 4"
                strokeLinecap="butt"
                dot={false}
                opacity={0.9}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {kpis.map((item) => (
            <Card key={item.label} className="rounded-[16px] p-2">
              <p className="text-[8px] font-medium uppercase tracking-[0.08em] text-[rgba(255,255,255,0.58)]">
                {item.label}
              </p>
              <p className={`mt-1 text-[16px] font-semibold leading-none tracking-[-0.02em] ${item.tone ?? "text-white"}`}>
                {item.value}
              </p>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="p-3">
        <SectionTitle eyebrow="Monate" title="Monatliche Entwicklung" />
        <div className="mt-2 h-[110px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlySeries} margin={{ top: 6, right: 2, left: -22, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.28)" tickLine={false} axisLine={false} fontSize={9} />
              <YAxis hide domain={[-3, 3]} />
              <Tooltip
                contentStyle={{
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(10,10,10,0.94)",
                  color: "#ffffff"
                }}
              />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {monthlySeries.map((entry) => (
                  <Cell key={entry.month} fill={entry.value >= 0 ? "#66C26F" : "#FF7A7A"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-3">
        <SectionTitle eyebrow="Risiko" title="Kontrollierte Risikofaktoren" />
        <div className="mt-2 grid grid-cols-3 gap-2">
          {risks.map((item) => (
            <Card key={item.label} className="rounded-[16px] p-2">
              <p className="text-[8px] font-medium uppercase tracking-[0.08em] text-[rgba(255,255,255,0.58)]">
                {item.label}
              </p>
              <p className="mt-1 text-[12px] font-semibold leading-tight text-white">{item.value}</p>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="p-3">
        <SectionTitle eyebrow="Weiter" title="Simulation starten" />
      </Card>
    </AppShell>
  );
}
