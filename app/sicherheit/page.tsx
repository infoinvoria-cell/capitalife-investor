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
    <AppShell riskNote={<RiskDisclosure />}>
      <TopBar />

      <Card className="p-3">
        <SectionTitle eyebrow="Sicherheit" title="Sicherheit & Infrastruktur" />
      </Card>

      <Card className="p-3">
        <SectionTitle eyebrow="Broker" title="RoboForex" subtitle="Regulierter Broker mit segregierten Konten" />
        <div className="mt-3 flex justify-center">
          <Image
            src="/assets/logos/roboforex.png"
            alt="RoboForex"
            width={118}
            height={34}
            className="h-[34px] w-auto object-contain"
          />
        </div>
      </Card>

      <Card className="p-3">
        <SectionTitle eyebrow="Liquiditaet" title="Top-Liquiditaetsanbieter" />
        <div className="mt-2 grid grid-cols-3 gap-2">
          {liquidityProviders.map((provider) => (
            <Card key={provider} className="rounded-[16px] p-2 text-center">
              <p className="text-[11px] font-semibold text-white">{provider}</p>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="p-3">
        <SectionTitle
          eyebrow="Verwahrung"
          title="Investorengelder"
          subtitle="Investorengelder werden getrennt verwahrt."
        />
      </Card>

      <Card className="p-3">
        <SectionTitle eyebrow="Infrastruktur" title="Execution Stack" />
        <div className="mt-2 grid grid-cols-3 gap-2">
          {infrastructure.map((item) => (
            <Card key={item} className="rounded-[16px] p-2 text-center">
              <p className="text-[10px] font-semibold leading-[1.2] text-white">{item}</p>
            </Card>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
