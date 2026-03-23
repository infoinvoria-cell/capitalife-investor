import Image from "next/image";

import { AppShell } from "@/components/layout/AppShell";
import { RiskDisclosure } from "@/components/layout/RiskDisclosure";
import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";

const liquidityProviders = ["LMAX", "Integral", "Currenex"];
const infrastructure = ["CopyFX Engine", "Execution Layer", "Risk Management"];

export default function SicherheitPage() {
  return (
    <AppShell riskNote={<RiskDisclosure />} transitionClassName="page-stack pb-1">
      <TopBar />

      <Card className="app-section-card">
        <SectionTitle eyebrow="Sicherheit" title="Sicherheit & Infrastruktur" />
      </Card>

      <Card className="app-section-card">
        <SectionTitle eyebrow="Broker" title="RoboForex" subtitle="Regulierter Broker mit segregierten Konten" />
        <div className="mt-[18px]">
          <div className="app-inner-panel flex min-h-[120px] items-center justify-center px-4 py-5">
            <Image
              src="/assets/logos/roboforex.png"
              alt="RoboForex"
              width={118}
              height={34}
              className="h-[34px] w-auto object-contain opacity-95"
            />
          </div>
        </div>
      </Card>

      <Card className="app-section-card">
        <SectionTitle eyebrow="Liquiditaet" title="Top-Liquiditaetsanbieter" />
        <div className="mt-[18px] grid grid-cols-3 gap-2">
          {liquidityProviders.map((provider) => (
            <Card key={provider} className="app-mini-card flex items-center justify-center text-center">
              <p className="text-[11px] font-semibold tracking-[-0.02em] text-white">{provider}</p>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="app-section-card">
        <SectionTitle
          eyebrow="Verwahrung"
          title="Investorengelder"
          subtitle="Investorengelder werden getrennt verwahrt."
        />
      </Card>

      <Card className="app-section-card">
        <SectionTitle eyebrow="Infrastruktur" title="Execution Stack" />
        <div className="mt-[18px] grid grid-cols-3 gap-2">
          {infrastructure.map((item) => (
            <Card key={item} className="app-mini-card flex items-center justify-center text-center">
              <p className="text-[10px] font-semibold leading-[1.2] tracking-[-0.02em] text-white">{item}</p>
            </Card>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
